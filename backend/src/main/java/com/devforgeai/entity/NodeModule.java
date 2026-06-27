package com.devforgeai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A module that belongs to a Node (not to the project directly).
 * Architecture: Project → Architecture → Node → NodeModule → NodeFeature
 */
@Entity
@Table(name = "node_modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NodeModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id")
    @JsonIgnore
    private Node node;

    @OneToMany(mappedBy = "nodeModule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<NodeFeature> features = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }
}
