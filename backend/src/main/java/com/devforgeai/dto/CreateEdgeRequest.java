package com.devforgeai.dto;

import lombok.Data;

@Data
public class CreateEdgeRequest {

    private String edgeKey;

    private String sourceNode;

    private String targetNode;

    private Long architectureId;
}