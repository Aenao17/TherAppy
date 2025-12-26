package stucanii.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.domain.*;
import stucanii.backend.repository.OnboardingRequestRepository;
import stucanii.backend.repository.UserRepository;

import java.util.List;

@Service
public class OnboardingService {

    private final UserRepository userRepository;
    private final OnboardingRequestRepository requestRepository;

    public OnboardingService(UserRepository userRepository, OnboardingRequestRepository requestRepository) {
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
    }

    @Transactional
    public void requestClient(String requesterUsername, String psychologistUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (requester.getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only USER accounts can request onboarding");
        }

        User target = userRepository.findByUsername(psychologistUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Psychologist not found"));

        if (target.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user is not a psychologist");
        }

        // optional: prevent duplicate pending requests
        boolean alreadyPending = requestRepository
                .findByRequesterIdOrderByCreatedAtDesc(requester.getId()).stream()
                .anyMatch(r -> r.getStatus() == RequestStatus.PENDING
                        && r.getType() == OnboardingType.REQUEST_CLIENT_OF_PSYCHOLOGIST);

        if (alreadyPending) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending client request");
        }

        requestRepository.save(new OnboardingRequest(
                requester,
                psychologistUsername,
                OnboardingType.REQUEST_CLIENT_OF_PSYCHOLOGIST
        ));
    }

    @Transactional
    public void requestPsychologist(String requesterUsername, String adminUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (requester.getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only USER accounts can request onboarding");
        }

        User target = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        if (target.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user is not an admin");
        }

        boolean alreadyPending = requestRepository
                .findByRequesterIdOrderByCreatedAtDesc(requester.getId()).stream()
                .anyMatch(r -> r.getStatus() == RequestStatus.PENDING
                        && r.getType() == OnboardingType.REQUEST_PSYCHOLOGIST_APPROVAL_BY_ADMIN);

        if (alreadyPending) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending psychologist request");
        }

        requestRepository.save(new OnboardingRequest(
                requester,
                adminUsername,
                OnboardingType.REQUEST_PSYCHOLOGIST_APPROVAL_BY_ADMIN
        ));
    }

    @Transactional(readOnly = true)
    public List<OnboardingRequest> inbox(String currentUsername) {
        return requestRepository.findByTargetUsernameAndStatus(currentUsername, RequestStatus.PENDING);
    }

    @Transactional
    public void approve(String approverUsername, Long requestId) {
        OnboardingRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        // Only the target user can approve
        if (!req.getTargetUsername().equalsIgnoreCase(approverUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your request");
        }

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }

        User requester = req.getRequester();

        if (req.getType() == OnboardingType.REQUEST_CLIENT_OF_PSYCHOLOGIST) {
            User psychologist = userRepository.findByUsername(req.getTargetUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Psychologist not found"));

            if (psychologist.getRole() != Role.PSYCHOLOGIST) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is not a psychologist");
            }

            requester.setRole(Role.CLIENT);
            requester.setPsychologist(psychologist);
        }

        if (req.getType() == OnboardingType.REQUEST_PSYCHOLOGIST_APPROVAL_BY_ADMIN) {
            User admin = userRepository.findByUsername(req.getTargetUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

            if (admin.getRole() != Role.ADMIN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is not an admin");
            }

            requester.setRole(Role.PSYCHOLOGIST);
            requester.setPsychologist(null);
        }

        req.approve();
        userRepository.save(requester);
        requestRepository.save(req);
    }

    @Transactional
    public void reject(String approverUsername, Long requestId) {
        OnboardingRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!req.getTargetUsername().equalsIgnoreCase(approverUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your request");
        }

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }

        req.reject();
        requestRepository.save(req);
    }
}
