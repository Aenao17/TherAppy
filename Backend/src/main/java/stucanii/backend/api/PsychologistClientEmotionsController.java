package stucanii.backend.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.domain.EmotionLog;
import stucanii.backend.repository.EmotionLogRepository;
import stucanii.backend.security.CryptoService;
import stucanii.backend.service.PsychologistClientsService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/psychologist/clients/{clientId}/emotions")
public class PsychologistClientEmotionsController {

    private final PsychologistClientsService access;
    private final EmotionLogRepository emotionRepo;
    private final CryptoService crypto;

    public PsychologistClientEmotionsController(
            PsychologistClientsService access,
            EmotionLogRepository emotionRepo,
            CryptoService crypto
    ) {
        this.access = access;
        this.emotionRepo = emotionRepo;
        this.crypto = crypto;
    }

    public record EmotionItem(Integer id, Instant createdAt, String text) {}
    public record EmotionListResponse(List<EmotionItem> items) {}

    @GetMapping
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public EmotionListResponse get(Authentication auth, @PathVariable Integer clientId) {
        access.requireMyClient(auth.getName(), clientId);

        List<EmotionItem> items = emotionRepo.findTop50ByUserIdOrderByCreatedAtDesc(clientId).stream()
                .map(e -> new EmotionItem(
                        e.getId(),
                        e.getCreatedAt(),
                        crypto.decrypt(e.getIv(), e.getCiphertext())
                ))
                .toList();

        return new EmotionListResponse(items);
    }
}