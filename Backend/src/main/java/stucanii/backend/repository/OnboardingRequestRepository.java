package stucanii.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import stucanii.backend.domain.OnboardingRequest;
import stucanii.backend.domain.RequestStatus;

import java.util.List;

public interface OnboardingRequestRepository extends JpaRepository<OnboardingRequest, Long> {

    List<OnboardingRequest> findByTargetUsernameAndStatus(String targetUsername, RequestStatus status);

    List<OnboardingRequest> findByRequesterIdOrderByCreatedAtDesc(Integer requesterId);
}