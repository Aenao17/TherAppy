package stucanii.backend.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "emotion_logs",
        indexes = {
                @Index(name = "idx_emotion_logs_user_created", columnList = "user_id, created_at")
        })
public class EmotionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_emotion_log_user"))
    private User user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // AES-GCM IV (12 bytes)
    @Column(name = "iv", nullable = false)
    private byte[] iv;

    // ciphertext (includes GCM tag at the end, in Java implementation)
    @Lob
    @Column(name = "ciphertext", nullable = false)
    private byte[] ciphertext;

    protected EmotionLog() {}

    public EmotionLog(User user, Instant createdAt, byte[] iv, byte[] ciphertext) {
        this.user = user;
        this.createdAt = createdAt;
        this.iv = iv;
        this.ciphertext = ciphertext;
    }

    public Integer getId() { return id; }
    public User getUser() { return user; }
    public Instant getCreatedAt() { return createdAt; }
    public byte[] getIv() { return iv; }
    public byte[] getCiphertext() { return ciphertext; }
}
