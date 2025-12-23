package stucanii.backend.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.api.dto.SignupRequest;
import stucanii.backend.api.dto.UserResponse;
import stucanii.backend.domain.User;
import stucanii.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse signup(@Valid @RequestBody SignupRequest req){
        User user = userService.signUp(req.username(),req.password());
        return new UserResponse(user.getId(), user.getUsername(), user.getRole().toString());
    }
}
