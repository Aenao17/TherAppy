package stucanii.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import stucanii.backend.api.events.PanicAckEvent;
import stucanii.backend.api.events.PanicWsEvent;
import stucanii.backend.domain.*;
import stucanii.backend.repository.PanicAlertRepository;
import stucanii.backend.repository.UserRepository;

import java.util.List;

@Service
public class PanicAlertService {

    private final UserRepository userRepository;
    private final PanicAlertRepository panicRepo;
    private final SimpMessagingTemplate messaging;

    public PanicAlertService(
            UserRepository userRepository,
            PanicAlertRepository panicRepo,
            SimpMessagingTemplate messaging
    ) {
        this.userRepository = userRepository;
        this.panicRepo = panicRepo;
        this.messaging = messaging;
    }


    @Transactional
    public PanicAlert trigger(String clientUsername, boolean longPress) {
        User client = userRepository.findByUsername(clientUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (client.getRole() != Role.CLIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only CLIENT can trigger panic");
        }

        User psych = client.getPsychologist();
        if (psych == null || psych.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Client has no psychologist assigned");
        }

        PanicAlert alert = new PanicAlert(client, psych, longPress);
        panicRepo.save(alert);

        messaging.convertAndSend(
                "/topic/panic/" + psych.getUsername(),
                new PanicWsEvent(
                        alert.getId(),
                        client.getUsername(),
                        longPress,
                        alert.getCreatedAt(),
                        alert.getVideoRoomId()
                )
        );

        return alert;

    }

    @Transactional(readOnly = true)
    public List<PanicAlert> psychologistInbox(String psychologistUsername) {
        User psych = userRepository.findByUsername(psychologistUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (psych.getRole() != Role.PSYCHOLOGIST) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PSYCHOLOGIST can view panic inbox");
        }

        return panicRepo.findTop50ByPsychologist_UsernameOrderByCreatedAtDesc(psychologistUsername);
    }

    @Transactional
    public void acknowledge(String psychologistUsername, Integer alertId, boolean withVideo) {
        PanicAlert alert = panicRepo.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        if (!alert.getPsychologist().getUsername().equalsIgnoreCase(psychologistUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your alert");
        }

        alert.acknowledge();
        panicRepo.save(alert);

        messaging.convertAndSend(
                "/topic/panic-updates/" + alert.getClient().getUsername(),
                new PanicAckEvent(
                        alert.getId(),
                        withVideo,
                        psychologistUsername,
                        alert.getVideoRoomId()
                )
        );
    }
}