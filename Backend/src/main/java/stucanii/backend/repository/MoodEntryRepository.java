package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.MoodEntry;

import java.util.List;

public interface MoodEntryRepository extends JpaRepository<MoodEntry, Integer> {

    List<MoodEntry> findTop30ByUserIdOrderByCreatedAtDesc(Integer userId);
}