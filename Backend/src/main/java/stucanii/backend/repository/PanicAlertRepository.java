package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.PanicAlert;
import stucanii.backend.domain.PanicStatus;

import java.util.List;

public interface PanicAlertRepository extends JpaRepository<PanicAlert, Integer> {

    List<PanicAlert> findByPsychologist_UsernameAndStatusOrderByCreatedAtDesc(String psychologistUsername, PanicStatus status);

    List<PanicAlert> findTop50ByPsychologist_UsernameOrderByCreatedAtDesc(String psychologistUsername);

    List<PanicAlert> findTop50ByClient_IdOrderByCreatedAtDesc(Integer clientId);
}
