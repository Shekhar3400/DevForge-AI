package com.devforgeai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Represents a file or folder in a project's virtual file system.
 * Persisted in DB; content stored as TEXT for files.
 * isFolder=true means it's a directory (content is null).
 */
@Entity
@Table(name = "project_files")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full path relative to project root, e.g. "src/main/java/Main.java" */
    @Column(nullable = false, length = 1000)
    private String path;

    /** File name only (last segment of path) */
    @Column(nullable = false)
    private String name;

    /** Parent path, e.g. "src/main/java" — empty string for root */
    @Column(nullable = false, length = 1000)
    private String parentPath;

    /** true = directory, false = file */
    @Column(nullable = false)
    private boolean folder;

    /** Source code / content (null for folders) */
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    /** Language hint for Monaco editor */
    private String language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
