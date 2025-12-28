package stucanii.backend.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.domain.MoodEntry;
import stucanii.backend.repository.MoodEntryRepository;
import stucanii.backend.security.CryptoService;
import stucanii.backend.service.PsychologistClientsService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/psychologist/clients/{clientId}/mood")
public class PsychologistClientMoodController {

    private final PsychologistClientsService access;
    private final MoodEntryRepository moodRepo;
    private final CryptoService crypto;

    public PsychologistClientMoodController(
            PsychologistClientsService access,
            MoodEntryRepository moodRepo,
            CryptoService crypto
    ) {
        this.access = access;
        this.moodRepo = moodRepo;
        this.crypto = crypto;
    }

    public record MoodPoint(Instant createdAt, int score) {}
    public record MoodSeriesResponse(List<MoodPoint> items) {}

    @GetMapping
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public MoodSeriesResponse get(
            Authentication auth,
            @PathVariable Integer clientId,
            @RequestParam(defaultValue = "30") int limit
    ) {
        access.requireMyClient(auth.getName(), clientId);

        int safeLimit = Math.max(1, Math.min(limit, 180));

        List<MoodEntry> entries = moodRepo.findTop30ByUserIdOrderByCreatedAtDesc(clientId);
        // dacă vrei limit real: schimbăm repo-ul cu findTopX custom query; momentan e top30

        List<MoodPoint> items = entries.stream()
                .limit(safeLimit)
                .map(e -> new MoodPoint(
                        e.getCreatedAt(),
                        Integer.parseInt(crypto.decrypt(e.getIv(), e.getCiphertext()))
                ))
                .toList();

        return new MoodSeriesResponse(items);
    }
}