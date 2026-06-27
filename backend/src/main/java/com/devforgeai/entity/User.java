package com.devforgeai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable for OAuth users who have no local password
    @Column
    private String password;

    // ── OAuth2 fields (new — not breaking existing LOCAL users) ─────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    /** Google sub / provider-specific ID */
    @Column(name = "provider_id")
    private String providerId;

    /** Google profile picture URL */
    @Column(name = "picture_url", length = 1000)
    private String pictureUrl;

    @Column(name = "email_verified")
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    /** Platform role — used for future collaboration features */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.OWNER;

    /** Audit */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Existing relations ───────────────────────────────────────────────────

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<Project> projects;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt  = LocalDateTime.now();
        this.updatedAt  = LocalDateTime.now();
        if (this.provider == null) this.provider = AuthProvider.LOCAL;
        if (this.role == null)     this.role     = Role.OWNER;
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
