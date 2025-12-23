package stucanii.backend.api.dto;

public record UserResponse(
    Integer id,
    String username,
    String role
) {}
