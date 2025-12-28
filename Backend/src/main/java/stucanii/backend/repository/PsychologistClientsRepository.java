package stucanii.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.Role;
import stucanii.backend.domain.User;

public interface PsychologistClientsRepository extends JpaRepository<User, Integer> {

    Page<User> findByRoleAndPsychologist_UsernameAndUsernameContainingIgnoreCase(
            Role role,
            String psychologistUsername,
            String search,
            Pageable pageable
    );
}
