package stucanii.backend.api.dto.responses;

public record UserResponse(
    Integer id,
    String username,
    String role
) {}
