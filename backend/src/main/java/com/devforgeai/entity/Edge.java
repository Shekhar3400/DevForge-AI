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

    /** Human-readable connection name e.g. "REST API", "JPA", "Kafka" */
    private String connectionName;

    /** Protocol: REST, GraphQL, WebSocket, Kafka, gRPC, RabbitMQ, JPA, Redis */
    private String protocol;

    /** Data format: JSON, XML, Binary, Protobuf */
    private String dataFormat;

    /** e.g. POST /api/users, GET /api/products */
    @Column(length = 2000)
    private String endpoints;

    /** Human description of what this connection does */
    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "architecture_id")
    @JsonIgnore
    private Architecture architecture;
}