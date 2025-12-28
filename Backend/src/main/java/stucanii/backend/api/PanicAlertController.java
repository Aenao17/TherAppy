package stucanii.backend.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import stucanii.backend.domain.PanicAlert;
import stucanii.backend.service.PanicAlertService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/panic")
public class PanicAlertController {

    private final PanicAlertService service;

    public PanicAlertController(PanicAlertService service) {
        this.service = service;
    }

    public record TriggerRequest(boolean longPress) {}
    public record TriggerResponse(Integer id) {}

    public record PanicAlertItem(
            Integer id,
            String clientUsername,
            String status,
            boolean triggeredByLongPress,
            Instant createdAt,
            Instant acknowledgedAt
    ) {}

    public record InboxResponse(List<PanicAlertItem> items) {}

    @PostMapping("/trigger")
    @PreAuthorize("hasRole('CLIENT')")
    public TriggerResponse trigger(Authentication auth, @RequestBody(required = false) TriggerRequest req) {
        boolean longPress = req != null && req.longPress();
        Integer id = service.trigger(auth.getName(), longPress);
        return new TriggerResponse(id);
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public InboxResponse inbox(Authentication auth) {
        List<PanicAlert> alerts = service.psychologistInbox(auth.getName());

        List<PanicAlertItem> items = alerts.stream()
                .map(a -> new PanicAlertItem(
                        a.getId(),
                        a.getClient().getUsername(),
                        a.getStatus().name(),
                        a.isTriggeredByLongPress(),
                        a.getCreatedAt(),
                        a.getAcknowledgedAt()
                ))
                .toList();

        return new InboxResponse(items);
    }

    @PostMapping("/{id}/ack")
    @PreAuthorize("hasRole('PSYCHOLOGIST')")
    public void ack(Authentication auth, @PathVariable Integer id) {
        service.acknowledge(auth.getName(), id);
    }
}