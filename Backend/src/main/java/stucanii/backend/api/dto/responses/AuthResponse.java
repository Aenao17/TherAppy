package stucanii.backend.api.dto.responses;

public record AuthResponse (
    String accessToken,
    String refreshToken,
    String tokenType
) {}