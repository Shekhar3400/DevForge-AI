package com.devforgeai.controller;

import com.devforgeai.dto.CreateArchitectureRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.service.ArchitectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/architectures")
@RequiredArgsConstructor
public class ArchitectureController {

    private final ArchitectureService architectureService;

    @PostMapping
    public Architecture createArchitecture(
            @RequestBody CreateArchitectureRequest request) {

        return architectureService.createArchitecture(request);
    }

    @GetMapping("/project/{projectId}")
    public List<Architecture> getArchitecturesByProject(
            @PathVariable Long projectId) {

        return architectureService.getArchitecturesByProject(projectId);
    }
}