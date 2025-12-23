package stucanii.backend.api.dto.requests;

import jakarta.validation.constraints.NotBlank;

public record SignupRequest (
   @NotBlank String username,
   @NotBlank String password
) {}