package stucanii.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "panic_alerts")
public class PanicAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psychologist_id", nullable = false)
    private User psychologist;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PanicStatus status = PanicStatus.OPEN;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = true)
    private Instant acknowledgedAt;

    // optional metadata
    @Column(nullable = false)
    private boolean triggeredByLongPress;

    protected PanicAlert() {}

    public PanicAlert(User client, User psychologist, boolean triggeredByLongPress) {
        this.client = client;
        this.psychologist = psychologist;
        this.triggeredByLongPress = triggeredByLongPress;
    }

    public Integer getId() { return id; }
    public User getClient() { return client; }
    public User getPsychologist() { return psychologist; }
    public PanicStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public boolean isTriggeredByLongPress() { return triggeredByLongPress; }

    public void acknowledge() {
        this.status = PanicStatus.ACKNOWLEDGED;
        this.acknowledgedAt = Instant.now();
    }

    public void resolve() {
        this.status = PanicStatus.RESOLVED;
    }
}