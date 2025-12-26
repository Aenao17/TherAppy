package stucanii.backend.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "onboarding_requests",
        indexes = {
                @Index(name = "idx_onboarding_request_status", columnList = "status"),
                @Index(name = "idx_onboarding_request_requester", columnList = "requester_id"),
                @Index(name = "idx_onboarding_request_target", columnList = "target_username")
        }
)
public class OnboardingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // userul care cere (accountul existent)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_onboarding_request_requester"))
    private User requester;

    // username-ul “target”-ului (psiholog sau admin) introdus în UI
    @Column(name = "target_username", nullable = false, length = 80)
    private String targetUsername;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private OnboardingType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected OnboardingRequest() {}

    public OnboardingRequest(User requester, String targetUsername, OnboardingType type) {
        this.requester = requester;
        this.targetUsername = targetUsername;
        this.type = type;
        this.status = RequestStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public User getRequester() { return requester; }
    public String getTargetUsername() { return targetUsername; }
    public OnboardingType getType() { return type; }
    public RequestStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void approve() { this.status = RequestStatus.APPROVED; }
    public void reject() { this.status = RequestStatus.REJECTED; }
}
