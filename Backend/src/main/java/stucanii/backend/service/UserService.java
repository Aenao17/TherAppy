package stucanii.backend.service;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
        return userRepository.save(user);
     }
}
