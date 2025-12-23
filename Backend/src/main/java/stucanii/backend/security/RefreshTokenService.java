package stucanii.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stucanii.backend.domain.RefreshToken;
import stucanii.backend.domain.User;
import stucanii.backend.repository.RefreshTokenRepository;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final long ttlSeconds;

    private final SecureRandom random = new SecureRandom();
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    public RefreshTokenService(RefreshTokenRepository repo,
                               @Value("${app.refresh.ttlSeconds}") long ttlSeconds) {
        this.repo = repo;
        this.ttlSeconds = ttlSeconds;
    }

    @Transactional
    public String issue(User user) {
        String token = generateToken();
        Instant exp = Instant.now().plusSeconds(ttlSeconds);
        repo.save(new RefreshToken(token, user, exp));
        return token;
    }

    @Transactional
    public User validateAndRotate(String refreshToken) {
        RefreshToken rt = repo.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (rt.isRevoked() || rt.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // rotation: invalidează tokenul vechi
        rt.revoke();

        return rt.getUser(); // user e LAZY, dar suntem în tranzacție
    }

    @Transactional
    public void revoke(String refreshToken) {
        RefreshToken rt = repo.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        rt.revoke();
    }

    private String generateToken() {
        byte[] bytes = new byte[48]; // ~64 chars base64url
        random.nextBytes(bytes);
        return encoder.encodeToString(bytes);
    }
}
