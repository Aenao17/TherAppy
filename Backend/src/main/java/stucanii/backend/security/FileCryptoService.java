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
public class FileCryptoService {

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public FileCryptoService(@Value("${app.crypto.aesKeyBase64}") String keyBase64) {
        byte[] k = Base64.getDecoder().decode(keyBase64);
        this.key = new SecretKeySpec(k, "AES");
    }

    public byte[] encrypt(byte[] plain) {
        try {
            byte[] iv = new byte[12];
            random.nextBytes(iv);

            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] ct = c.doFinal(plain);

            // store: iv + ct
            byte[] out = new byte[iv.length + ct.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(ct, 0, out, iv.length, ct.length);
            return out;
        } catch (Exception e) {
            throw new RuntimeException("Encrypt failed", e);
        }
    }

    public byte[] decrypt(byte[] data) {
        try {
            byte[] iv = new byte[12];
            System.arraycopy(data, 0, iv, 0, 12);

            byte[] ct = new byte[data.length - 12];
            System.arraycopy(data, 12, ct, 0, ct.length);

            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            return c.doFinal(ct);
        } catch (Exception e) {
            throw new RuntimeException("Decrypt failed", e);
        }
    }
}
