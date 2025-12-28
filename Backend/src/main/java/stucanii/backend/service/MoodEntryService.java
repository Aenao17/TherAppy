package stucanii.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.domain.MoodEntry;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;
import stucanii.backend.repository.MoodEntryRepository;
import stucanii.backend.repository.UserRepository;
import stucanii.backend.security.CryptoService;

import java.time.Instant;
import java.util.List;

@Service
public class MoodEntryService {

    private final MoodEntryRepository moodEntryRepository;
    private final UserRepository userRepository;
    private final CryptoService cryptoService;

    public MoodEntryService(MoodEntryRepository moodEntryRepository, UserRepository userRepository, CryptoService cryptoService) {
        this.moodEntryRepository = moodEntryRepository;
        this.userRepository = userRepository;
        this.cryptoService = cryptoService;
    }

    @Transactional
    public Integer create(String username, int score) {
        if (score < 1 || score > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score must be between 1 and 5");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CLIENT can create mood entries");
        }

        var enc = cryptoService.encrypt(String.valueOf(score));

        MoodEntry saved = moodEntryRepository.save(new MoodEntry(
                user,
                Instant.now(),
                enc.iv(),
                enc.ciphertext()
        ));

        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<MoodItem> latest(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CLIENT can view mood entries");
        }

        return moodEntryRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(e -> new MoodItem(
                        e.getId(),
                        e.getCreatedAt(),
                        Integer.parseInt(cryptoService.decrypt(e.getIv(), e.getCiphertext()))
                ))
                .toList();
    }

    public record MoodItem(Integer id, Instant createdAt, int score) {}
}