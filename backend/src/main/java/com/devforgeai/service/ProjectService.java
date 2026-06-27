package com.devforgeai.service;

import com.devforgeai.dto.CreateProjectRequest;
import com.devforgeai.dto.ProjectResponse;
import com.devforgeai.entity.Project;
import com.devforgeai.entity.User;
import com.devforgeai.exception.ForbiddenException;
import com.devforgeai.exception.ResourceNotFoundException;
import com.devforgeai.repository.ProjectRepository;
import com.devforgeai.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SecurityHelper    securityHelper;

    public ProjectResponse createProject(CreateProjectRequest request) {
        User owner = securityHelper.getCurrentUser();
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();
        return mapToResponse(projectRepository.save(project));
    }

    /** Returns ONLY projects owned by the authenticated user */
    public List<ProjectResponse> getAllProjects() {
        User owner = securityHelper.getCurrentUser();
        return projectRepository.findByOwner(owner)
                .stream().map(this::mapToResponse).toList();
    }

    public ProjectResponse getProjectById(Long id) {
        Project project = findOwnedProject(id);
        return mapToResponse(project);
    }

    public void deleteProject(Long id) {
        findOwnedProject(id); // ownership check
        projectRepository.deleteById(id);
    }

    /** Verifies the project exists AND belongs to the current user. Throws 403 otherwise. */
    public Project findOwnedProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        User current = securityHelper.getCurrentUser();
        if (!project.getOwner().getId().equals(current.getId())) {
            throw new ForbiddenException("You do not have access to project " + projectId);
        }
        return project;
    }

    private ProjectResponse mapToResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .ownerName(p.getOwner() != null ? p.getOwner().getName() : null)
                .ownerEmail(p.getOwner() != null ? p.getOwner().getEmail() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
