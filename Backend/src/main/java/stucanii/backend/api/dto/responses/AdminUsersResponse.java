package stucanii.backend.api.dto.responses;

import stucanii.backend.api.dto.AdminUserItem;

import java.util.List;

public record AdminUsersResponse(
        List<AdminUserItem> users
) {}
