package stucanii.backend.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "psychologist_clients",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_psychologist_client",
                columnNames = {"psychologist_id", "client_id"}
        ),
        indexes = {
                @Index(name = "idx_psych_client_psychologist", columnList = "psychologist_id"),
                @Index(name = "idx_psych_client_client", columnList = "client_id")
        }
)
public class PsychologistClientLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "psychologist_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_psych_client_psychologist"))
    private User psychologist;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_psych_client_client"))
    private User client;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected PsychologistClientLink() {}

    public PsychologistClientLink(User psychologist, User client) {
        this.psychologist = psychologist;
        this.client = client;
        this.active = true;
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public User getPsychologist() { return psychologist; }
    public User getClient() { return client; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }

    public void setActive(boolean active) { this.active = active; }
}