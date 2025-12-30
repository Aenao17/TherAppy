package stucanii.backend.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import stucanii.backend.domain.EducationalMaterial;
import stucanii.backend.service.EducationalMaterialService;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class EducationalMaterialController {

    private final EducationalMaterialService service;

    public EducationalMaterialController(EducationalMaterialService service) {
        this.service = service;
    }

    public record MaterialItem(Integer id, String filename, String contentType, long sizeBytes, String uploadedAt) {}
    public record ListResponse(List<MaterialItem> items) {}
    public record UploadResponse(Integer id) {}

    @PostMapping(value = "/clients/{clientId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public UploadResponse upload(Authentication auth,
                                 @PathVariable Integer clientId,
                                 @RequestPart("file") MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() == null ? "material" : file.getOriginalFilename();
        String ct = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

        Integer id = service.uploadForClient(auth.getName(), clientId, filename, ct, file.getBytes());
        return new UploadResponse(id);
    }
    // psychologist list for a specific client
    @GetMapping("/clients/{clientId}")
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public ListResponse listForClient(Authentication auth, @PathVariable Integer clientId) {
        List<EducationalMaterial> items = service.listForClientAsPsychologist(auth.getName(), clientId);
        return new ListResponse(items.stream().map(m ->
                new MaterialItem(m.getId(), m.getOriginalFilename(), m.getContentType(), m.getSizeBytes(), m.getUploadedAt().toString())
        ).toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public void delete(Authentication auth, @PathVariable Integer id) {
        service.deleteAsPsychologist(auth.getName(), id);
    }

    // client list (their own)
    @GetMapping("/mine")
    @PreAuthorize("hasRole('CLIENT')")
    public ListResponse myMaterials(Authentication auth) {
        List<EducationalMaterial> items = service.listForSelfClient(auth.getName());
        return new ListResponse(items.stream().map(m ->
                new MaterialItem(m.getId(), m.getOriginalFilename(), m.getContentType(), m.getSizeBytes(), m.getUploadedAt().toString())
        ).toList());
    }

    // download as psychologist
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('CLIENT','PSYCHOLOGIST')")
    public ResponseEntity<byte[]> download(Authentication auth, @PathVariable Integer id) {
        boolean isClient = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CLIENT"));

        EducationalMaterialService.DownloadedMaterial d = isClient
                ? service.downloadAsClient(auth.getName(), id)
                : service.downloadAsPsychologist(auth.getName(), id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + d.filename() + "\"")
                .contentType(MediaType.parseMediaType(d.contentType()))
                .body(d.bytes());
    }
}