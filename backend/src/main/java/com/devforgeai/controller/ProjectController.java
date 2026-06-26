package com.devforgeai.controller;

import com.devforgeai.dto.CreateProjectRequest;
import com.devforgeai.dto.ProjectResponse;
import com.devforgeai.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ProjectResponse createProject(
            @RequestBody CreateProjectRequest request) {

        return projectService.createProject(request);
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects() {

        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ProjectResponse getProjectById(
            @PathVariable Long id) {

        return projectService.getProjectById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(
            @PathVariable Long id) {

        projectService.deleteProject(id);
    }
}