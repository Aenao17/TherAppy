package stucanii.backend.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "mood_entries",
        indexes = {
                @Index(name = "idx_mood_entries_user_created", columnList = "user_id, created_at")
        })
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_mood_entry_user"))
    private User user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "iv", nullable = false, columnDefinition = "bytea")
    private byte[] iv;

    @Column(name = "ciphertext", nullable = false, columnDefinition = "bytea")
    private byte[] ciphertext;

    protected MoodEntry() {}

    public MoodEntry(User user, Instant createdAt, byte[] iv, byte[] ciphertext) {
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