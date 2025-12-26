package stucanii.backend.api.dto.requests;

import jakarta.validation.constraints.NotBlank;

public record CreateOnboardingRequest(
        @NotBlank String targetUsername
) {}
