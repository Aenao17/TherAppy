package stucanii.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.domain.EducationalMaterial;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;
import stucanii.backend.repository.EducationalMaterialRepository;
import stucanii.backend.repository.UserRepository;
import stucanii.backend.security.FileCryptoService;

import java.util.List;

@Service
public class EducationalMaterialService {

    private final UserRepository users;
    private final EducationalMaterialRepository repo;
    private final FileCryptoService crypto;

    public EducationalMaterialService(UserRepository users, EducationalMaterialRepository repo, FileCryptoService crypto) {
        this.users = users;
        this.repo = repo;
        this.crypto = crypto;
    }

    @Transactional
    public Integer uploadForClient(String psychologistUsername, Integer clientId, String filename, String contentType, byte[] bytes) {
        User psych = users.findByUsername(psychologistUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (psych.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only psychologist can upload materials");
        }

        User client = users.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

        if (client.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is not a client");
        }

        if (client.getPsychologist() == null || !client.getPsychologist().getId().equals(psych.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This client is not assigned to you");
        }

        byte[] enc = crypto.encrypt(bytes);

        EducationalMaterial m = new EducationalMaterial(
                client,
                psych,
                filename,
                contentType,
                bytes.length,
                enc
        );

        repo.save(m);
        return m.getId();
    }

    @Transactional(readOnly = true)
    public List<EducationalMaterial> listForClientAsPsychologist(String psychologistUsername, Integer clientId) {
        return repo.findByPsychologist_UsernameAndClient_IdOrderByUploadedAtDesc(psychologistUsername, clientId);
    }

    @Transactional(readOnly = true)
    public List<EducationalMaterial> listForSelfClient(String clientUsername) {
        User client = users.findByUsername(clientUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return repo.findByClient_IdOrderByUploadedAtDesc(client.getId());
    }

    @Transactional(readOnly = true)
    public DownloadedMaterial downloadAsPsychologist(String psychologistUsername, Integer materialId) {
        EducationalMaterial m = repo.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        if (!m.getPsychologist().getUsername().equalsIgnoreCase(psychologistUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your material");
        }

        return new DownloadedMaterial(m.getOriginalFilename(), m.getContentType(), crypto.decrypt(m.getEncryptedData()));
    }

    @Transactional
    public void deleteAsPsychologist(String psychologistUsername, Integer materialId) {
        EducationalMaterial m = repo.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        if (!m.getPsychologist().getUsername().equalsIgnoreCase(psychologistUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your material");
        }

        repo.delete(m);
    }

    @Transactional(readOnly = true)
    public DownloadedMaterial downloadAsClient(String clientUsername, Integer materialId) {
        User client = users.findByUsername(clientUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        EducationalMaterial m = repo.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        if (!m.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your material");
        }

        return new DownloadedMaterial(m.getOriginalFilename(), m.getContentType(), crypto.decrypt(m.getEncryptedData()));
    }

    public record DownloadedMaterial(String filename, String contentType, byte[] bytes) {}
}
