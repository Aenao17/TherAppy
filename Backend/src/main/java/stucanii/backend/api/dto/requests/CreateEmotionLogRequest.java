package stucanii.backend.api.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEmotionLogRequest(
        @NotBlank
        @Size(max = 5000)
        String text
) {}