package com.devforgeai.controller;

import com.devforgeai.dto.ProjectContextResponse;
import com.devforgeai.service.ProjectContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/context")
@RequiredArgsConstructor
public class ProjectContextController {

    private final ProjectContextService projectContextService;

    @GetMapping("/project/{projectId}")
    public ProjectContextResponse getProjectContext(
            @PathVariable Long projectId
    ) {

        return ProjectContextResponse.builder()
                .contextJson(
                        projectContextService
                                .getProjectContext(projectId)
                )
                .build();
    }

    @PostMapping("/project/{projectId}/regenerate")
    public ProjectContextResponse regenerateContext(
            @PathVariable Long projectId
    ) {

        return ProjectContextResponse.builder()
                .contextJson(
                        projectContextService
                                .regenerateContext(projectId)
                )
                .build();
    }
}