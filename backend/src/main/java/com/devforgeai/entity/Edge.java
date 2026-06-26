package com.devforgeai.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "edges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String edgeKey;

    private String sourceNode;

    private String targetNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "architecture_id")
    @JsonIgnore
    private Architecture architecture;
}