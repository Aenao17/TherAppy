package stucanii.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import stucanii.backend.api.error.UnauthorizedException;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;
import stucanii.backend.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User signUp(String username, String password) {
        if (userRepository.existsByUsername(username.trim())) {
            throw new IllegalArgumentException("Username already taken");
        }

        String hash = passwordEncoder.encode(password);
        User user = new User(username, hash);
        user.setRole(Role.USER);
        return userRepository.save(user);
     }

    @Transactional
    public User login(String username, String password) {
        String normalizedUsername = username.trim();

        User user = userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }
        return user;
    }
}