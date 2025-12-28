package stucanii.backend.api;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.api.dto.*;
import stucanii.backend.api.dto.requests.CreateEmotionLogRequest;
import stucanii.backend.api.dto.responses.CreateEmotionLogResponse;
import stucanii.backend.api.dto.responses.EmotionLogListResponse;
import stucanii.backend.service.EmotionLogService;

import java.util.List;

@RestController
@RequestMapping("/api/emotions")
public class EmotionLogController {

    private final EmotionLogService emotionLogService;

    public EmotionLogController(EmotionLogService emotionLogService) {
        this.emotionLogService = emotionLogService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public CreateEmotionLogResponse create(Authentication auth, @Valid @RequestBody CreateEmotionLogRequest req) {
        Integer id = emotionLogService.create(auth.getName(), req.text());
        return new CreateEmotionLogResponse(id);
    }

    @GetMapping
    @PreAuthorize("hasRole('CLIENT')")
    public EmotionLogListResponse list(Authentication auth) {
        var items = emotionLogService.latestForUser(auth.getName());

        List<EmotionLogResponseItem> resp = items.stream()
                .map(i -> new EmotionLogResponseItem(i.id(), i.createdAt(), i.text()))
                .toList();

        return new EmotionLogListResponse(resp);
    }
}
