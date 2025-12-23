package stucanii.backend.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.api.dto.requests.LoginRequest;
import stucanii.backend.api.dto.requests.LogoutRequest;
import stucanii.backend.api.dto.requests.RefreshRequest;
import stucanii.backend.api.dto.requests.SignupRequest;
import stucanii.backend.api.dto.responses.AuthResponse;
import stucanii.backend.api.dto.responses.UserResponse;
import stucanii.backend.domain.User;
import stucanii.backend.security.JwtService;
import stucanii.backend.security.RefreshTokenService;
import stucanii.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserService userService, JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse signup(@Valid @RequestBody SignupRequest req){
        User user = userService.signUp(req.username(),req.password());
        return new UserResponse(user.getId(), user.getUsername(), user.getRole().toString());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User user = userService.login(req.username(), req.password());
        String access = jwtService.createToken(user);
        String refresh = refreshTokenService.issue(user);
        return new AuthResponse(access, refresh, "Bearer");
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest req) {
        // validează + rotate (revocă vechiul)
        User user = refreshTokenService.validateAndRotate(req.refreshToken());

        // emite tokenuri noi
        String access = jwtService.createToken(user);
        String refresh = refreshTokenService.issue(user);

        return new AuthResponse(access, refresh, "Bearer");
    }

    @PostMapping("/logout")
    public void logout(@Valid @RequestBody LogoutRequest req) {
        refreshTokenService.revoke(req.refreshToken());
    }


}
