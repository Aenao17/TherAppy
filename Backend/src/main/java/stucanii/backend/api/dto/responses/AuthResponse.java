package stucanii.backend.api.dto.responses;

public record AuthResponse (
    String accesToken,
    String refreshToke,
    String tokenType
) {}