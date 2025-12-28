package stucanii.backend.api.dto.responses;

import stucanii.backend.api.dto.EmotionLogResponseItem;

import java.util.List;

public record EmotionLogListResponse(
        List<EmotionLogResponseItem> items
) {}
