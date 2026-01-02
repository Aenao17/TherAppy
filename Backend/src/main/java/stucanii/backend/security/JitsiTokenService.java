package stucanii.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JitsiTokenService {

    @Value("${jitsi.app-id}")
    private String appId;

    @Value("${jitsi.key-id}")
    private String keyId;

    @Value("${jitsi.private-key}")
    private String privateKeyContent;

    /**
     * Generează un token JWT pentru Jitsi care permite utilizatorului să fie MODERATOR.
     * Acest token este valabil 1 oră.
     */
    public String generateToken(String userName, String userEmail, String avatarUrl, String roomName) {
        try {
            PrivateKey privateKey = loadPrivateKey(privateKeyContent);

            Instant now = Instant.now();

            // Contextul utilizatorului (cine este el în conferință)
            Map<String, Object> context = new HashMap<>();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("name", userName);
            userMap.put("email", userEmail);
            userMap.put("avatar", avatarUrl);
            userMap.put("moderator", true); // <--- Aici e magia! Îl facem moderator automat.

            context.put("user", userMap);

            // Setări pentru funcționalități (features)
            Map<String, Object> features = new HashMap<>();
            features.put("livestreaming", true);
            features.put("recording", true);
            features.put("transcription", true);
            features.put("outbound-call", true);
            context.put("features", features);

            return Jwts.builder()
                    .setHeaderParam("typ", "JWT")
                    .setHeaderParam("kid", keyId)
                    .setIssuer("chat") // Standard pentru Jitsi 8x8
                    .setSubject(appId)
                    .setAudience("jitsi")
                    .setExpiration(Date.from(now.plus(1, ChronoUnit.HOURS)))
                    .setNotBefore(Date.from(now))
                    .setIssuedAt(Date.from(now))
                    .claim("context", context)
                    .claim("room", "*") // Sau specific roomName dacă vrei să restricționezi
                    .signWith(privateKey, SignatureAlgorithm.RS256)
                    .compact();

        } catch (Exception e) {
            throw new RuntimeException("Nu am putut genera token-ul Jitsi", e);
        }
    }

    private PrivateKey loadPrivateKey(String keyContent) throws Exception {
        // Curățăm header-ul și footer-ul cheii PEM
        String privateKeyPEM = keyContent
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", ""); // Eliminăm spațiile și newlines

        byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
        return keyFactory.generatePrivate(keySpec);
    }
}