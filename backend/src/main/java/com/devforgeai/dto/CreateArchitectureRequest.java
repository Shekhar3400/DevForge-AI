package com.devforgeai.dto;

import lombok.Data;

@Data
public class CreateArchitectureRequest {

    private String name;

    private Long projectId;
}