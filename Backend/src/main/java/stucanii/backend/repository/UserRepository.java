package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
