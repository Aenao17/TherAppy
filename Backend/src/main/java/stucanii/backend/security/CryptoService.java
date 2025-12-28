package stucanii.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class CryptoService {

    private static final String ALGO = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_BYTES = 12; // recommended for GCM

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public CryptoService(@Value("${app.crypto.aesKeyBase64}") String aesKeyBase64) {
        byte[] keyBytes = Base64.getDecoder().decode(aesKeyBase64);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("APP_AES_KEY_BASE64 must decode to 32 bytes (AES-256).");
        }
        this.key = new SecretKeySpec(keyBytes, ALGO);
    }

    public EncryptedPayload encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return new EncryptedPayload(iv, ciphertext);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(byte[] iv, byte[] ciphertext) {
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));

            byte[] plain = cipher.doFinal(ciphertext);
            return new String(plain, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    public record EncryptedPayload(byte[] iv, byte[] ciphertext) {}
}