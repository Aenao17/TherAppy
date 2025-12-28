package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.EmotionLog;

import java.util.List;

public interface EmotionLogRepository extends JpaRepository<EmotionLog, Integer> {
    List<EmotionLog> findTop50ByUserIdOrderByCreatedAtDesc(Integer userId);
}
