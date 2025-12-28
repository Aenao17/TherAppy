package stucanii.backend.api.dto;

import java.time.Instant;

public record EmotionLogItem(
        Integer id,
        Instant createdAt,
        String text
) {}