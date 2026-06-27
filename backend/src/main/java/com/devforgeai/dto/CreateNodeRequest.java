package com.devforgeai.dto;

import lombok.Data;

@Data
public class CreateNodeRequest {

    private String nodeKey;

    private String label;

    private String type;

    private String technology;

    private String framework;

    private Double positionX;

    private Double positionY;

    private Long architectureId;
}