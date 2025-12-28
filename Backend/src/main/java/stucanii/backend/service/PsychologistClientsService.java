package stucanii.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;
import stucanii.backend.repository.PsychologistClientsRepository;
import stucanii.backend.repository.UserRepository;

@Service
public class PsychologistClientsService {

    private final UserRepository userRepository;
    private final PsychologistClientsRepository clientsRepository;

    public PsychologistClientsService(UserRepository userRepository,
                                      PsychologistClientsRepository clientsRepository) {
        this.userRepository = userRepository;
        this.clientsRepository = clientsRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClientDto> listMyClients(
            String psychologistUsername,
            String search,
            Pageable pageable
    ) {
        User me = userRepository.findByUsername(psychologistUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (me.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PSYCHOLOGIST can view clients");
        }

        String s = (search == null) ? "" : search.trim();

        return clientsRepository
                .findByRoleAndPsychologist_UsernameAndUsernameContainingIgnoreCase(
                        Role.CLIENT,
                        psychologistUsername,
                        s,
                        pageable
                )
                .map(u -> new ClientDto(u.getId(), u.getUsername()));
    }

    public record ClientDto(Integer id, String username) {}

    @Transactional(readOnly = true)
    public User requireMyClient(String psychologistUsername, Integer clientId) {
        User psychologist = userRepository.findByUsername(psychologistUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (psychologist.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PSYCHOLOGIST allowed");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

        if (client.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is not a CLIENT");
        }

        if (client.getPsychologist() == null ||
                !client.getPsychologist().getUsername().equalsIgnoreCase(psychologistUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your client");
        }

        return client;
    }
}