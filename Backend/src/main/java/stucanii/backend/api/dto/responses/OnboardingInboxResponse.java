package stucanii.backend.api.dto.responses;

import stucanii.backend.api.dto.OnboardingRequestItem;

import java.util.List;

public record OnboardingInboxResponse(
        List<OnboardingRequestItem> requests
) {}
