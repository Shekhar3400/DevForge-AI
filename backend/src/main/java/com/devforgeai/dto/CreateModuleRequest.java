package com.devforgeai.dto;

import lombok.Data;

@Data
public class CreateModuleRequest {

    private String name;

    private Long projectId;
}