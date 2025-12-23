package stucanii.backend.api.dto.requests;

import jakarta.validation.constraints.NotNull;

public record LoginRequest(
    @NotNull String username,
    @NotNull String password
) {}
