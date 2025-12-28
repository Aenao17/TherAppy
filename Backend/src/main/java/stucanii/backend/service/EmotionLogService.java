package stucanii.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.api.dto.EmotionLogItem;
import stucanii.backend.domain.EmotionLog;
import stucanii.backend.domain.User;
import stucanii.backend.repository.EmotionLogRepository;
import stucanii.backend.repository.UserRepository;
import stucanii.backend.security.CryptoService;

import java.time.Instant;
import java.util.List;

@Service
public class EmotionLogService {

    private final EmotionLogRepository emotionLogRepository;
    private final UserRepository userRepository;
    private final CryptoService cryptoService;

    public EmotionLogService(
            EmotionLogRepository emotionLogRepository,
            UserRepository userRepository,
            CryptoService cryptoService
    ) {
        this.emotionLogRepository = emotionLogRepository;
        this.userRepository = userRepository;
        this.cryptoService = cryptoService;
    }

    @Transactional
    public Integer create(String username, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Text is required");
        }
        if (text.length() > 5000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Text too long (max 5000 chars)");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // IMPORTANT: only CLIENT can write emotions (as requested)
        if (user.getRole() != stucanii.backend.domain.Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CLIENT can create emotion logs");
        }

        var enc = cryptoService.encrypt(text.trim());

        EmotionLog log = new EmotionLog(
                user,
                Instant.now(),
                enc.iv(),
                enc.ciphertext()
        );

        EmotionLog saved = emotionLogRepository.save(log);
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<EmotionLogItem> latestForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() != stucanii.backend.domain.Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CLIENT can view emotion logs");
        }

        return emotionLogRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(e -> new EmotionLogItem(
                        e.getId(),
                        e.getCreatedAt(),
                        cryptoService.decrypt(e.getIv(), e.getCiphertext())
                ))
                .toList();
    }
}