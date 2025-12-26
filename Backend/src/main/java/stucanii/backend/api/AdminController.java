package stucanii.backend.api;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.api.dto.AdminUserItem;
import stucanii.backend.api.dto.requests.ChangeRoleRequest;
import stucanii.backend.api.dto.responses.AdminStatsResponse;
import stucanii.backend.api.dto.responses.AdminUsersResponse;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;
import stucanii.backend.repository.RefreshTokenRepository;
import stucanii.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AdminController(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(userRepository.count());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUsersResponse users() {
        List<AdminUserItem> items = userRepository.findAll().stream()
                .map(u -> new AdminUserItem(u.getId(), u.getUsername(), u.getRole().name()))
                .toList();

        return new AdminUsersResponse(items);
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public void changeRole(@PathVariable Long id, @Valid @RequestBody ChangeRoleRequest req) {
        Role newRole;
        try {
            newRole = Role.valueOf(req.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(newRole);
        userRepository.save(user);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteUser(@PathVariable Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        // 1) delete dependent rows
        refreshTokenRepository.deleteAllByUserId(id);

        // 2) delete user
        userRepository.deleteById(id);
    }

    @GetMapping("/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> ping() {
        return Map.of("status", "ok");
    }
}