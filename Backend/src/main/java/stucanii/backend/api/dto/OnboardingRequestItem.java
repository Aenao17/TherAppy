package stucanii.backend.api.dto;

import java.time.Instant;

public record OnboardingRequestItem(
        Integer id,
        String requesterUsername,
        String targetUsername,
        String type,
        String status,
        Instant createdAt
) {}
