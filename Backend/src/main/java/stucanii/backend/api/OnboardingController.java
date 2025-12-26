package stucanii.backend.api;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.api.dto.OnboardingRequestItem;
import stucanii.backend.api.dto.requests.CreateOnboardingRequest;
import stucanii.backend.api.dto.responses.OnboardingInboxResponse;
import stucanii.backend.domain.OnboardingRequest;
import stucanii.backend.service.OnboardingService;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/request-client")
    @PreAuthorize("hasRole('USER')")
    public void requestClient(Authentication auth, @Valid @RequestBody CreateOnboardingRequest req) {
        onboardingService.requestClient(auth.getName(), req.targetUsername().trim());
    }

    @PostMapping("/request-psychologist")
    @PreAuthorize("hasRole('USER')")
    public void requestPsychologist(Authentication auth, @Valid @RequestBody CreateOnboardingRequest req) {
        onboardingService.requestPsychologist(auth.getName(), req.targetUsername().trim());
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyRole('ADMIN','PSYCHOLOGIST')")
    public OnboardingInboxResponse inbox(Authentication auth) {
        List<OnboardingRequest> reqs = onboardingService.inbox(auth.getName());

        List<OnboardingRequestItem> items = reqs.stream()
                .map(r -> new OnboardingRequestItem(
                        r.getId(),
                        r.getRequester().getUsername(),
                        r.getTargetUsername(),
                        r.getType().name(),
                        r.getStatus().name(),
                        r.getCreatedAt()
                ))
                .toList();

        return new OnboardingInboxResponse(items);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','PSYCHOLOGIST')")
    public void approve(Authentication auth, @PathVariable Long id) {
        onboardingService.approve(auth.getName(), id);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','PSYCHOLOGIST')")
    public void reject(Authentication auth, @PathVariable Long id) {
        onboardingService.reject(auth.getName(), id);
    }
}
