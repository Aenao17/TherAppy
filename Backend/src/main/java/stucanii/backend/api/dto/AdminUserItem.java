package stucanii.backend.api.dto;

public record AdminUserItem(
        long id,
        String username,
        String role
) {}