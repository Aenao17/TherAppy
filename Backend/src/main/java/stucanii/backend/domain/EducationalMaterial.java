package stucanii.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "educational_materials")
public class EducationalMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "psychologist_id", nullable = false)
    private User psychologist;

    @Column(nullable = false, length = 260)
    private String originalFilename;

    @Column(nullable = false, length = 120)
    private String contentType;

    @Column(nullable = false)
    private long sizeBytes;

    // IMPORTANT: bytea, not Large Object
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] encryptedData;

    @Column(nullable = false)
    private Instant uploadedAt = Instant.now();

    protected EducationalMaterial() {}

    public EducationalMaterial(User client, User psychologist, String originalFilename, String contentType, long sizeBytes, byte[] encryptedData) {
        this.client = client;
        this.psychologist = psychologist;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.encryptedData = encryptedData;
    }

    public Integer getId() { return id; }
    public User getClient() { return client; }
    public User getPsychologist() { return psychologist; }
    public String getOriginalFilename() { return originalFilename; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public byte[] getEncryptedData() { return encryptedData; }
    public Instant getUploadedAt() { return uploadedAt; }
}