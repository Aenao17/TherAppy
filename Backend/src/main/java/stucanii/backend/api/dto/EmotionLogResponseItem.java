package stucanii.backend.api.dto;

import java.time.Instant;

public record EmotionLogResponseItem(
        Integer id,
        Instant createdAt,
        String text
) {}
