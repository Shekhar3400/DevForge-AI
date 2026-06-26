package com.devforgeai.dto;

import lombok.Data;

@Data
public class CreateFeatureRequest {

    private String name;

    private String description;

    private Long moduleId;
}