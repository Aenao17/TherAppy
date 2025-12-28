package stucanii.backend.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.service.MoodEntryService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/mood")
public class MoodEntryController {

    private final MoodEntryService service;

    public MoodEntryController(MoodEntryService service) {
        this.service = service;
    }

    public record CreateMoodRequest(@Min(1) @Max(5) int score) {}
    public record CreateMoodResponse(Integer id) {}
    public record MoodResponseItem(Integer id, Instant createdAt, int score) {}
    public record MoodListResponse(List<MoodResponseItem> items) {}

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public CreateMoodResponse create(Authentication auth, @RequestBody CreateMoodRequest req) {
        Integer id = service.create(auth.getName(), req.score());
        return new CreateMoodResponse(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public MoodListResponse list(Authentication auth) {
        var items = service.latest(auth.getName()).stream()
                .map(i -> new MoodResponseItem(i.id(), i.createdAt(), i.score()))
                .toList();
        return new MoodListResponse(items);
    }
}