package stucanii.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import stucanii.backend.domain.User;

import java.time.Instant;

import static org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final long ttlSeconds;

    public JwtService(JwtEncoder encoder,
                      @Value("${app.jwt.ttlSeconds}") long ttlSeconds) {
        this.encoder = encoder;
        this.ttlSeconds = ttlSeconds;
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(ttlSeconds);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("therappy-backend")
                .issuedAt(now)
                .expiresAt(exp)
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .build();

        JwsHeader header = JwsHeader.with(HS256).build();

        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

}
