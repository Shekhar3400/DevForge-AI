package com.devforgeai.service;

import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.User;
import com.devforgeai.exception.ForbiddenException;
import com.devforgeai.exception.ResourceNotFoundException;
import com.devforgeai.repository.ArchitectureRepository;
import com.devforgeai.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Verifies that sub-resources (architectures, nodes, edges, chats, files…)
 * belong to the authenticated user via the project ownership chain.
 *
 * Project → Architecture → Nodes / Edges
 * Project → ChatSession → Messages
 * Project → ProjectFile
 */
@Service
@RequiredArgsConstructor
public class OwnershipService {

    private final ArchitectureRepository architectureRepository;
    private final SecurityHelper         securityHelper;
    private final ProjectService         projectService;

    /**
     * Verifies that the architecture belongs to an owned project.
     * Returns the architecture.
     */
    public Architecture verifyArchitectureOwnership(Long architectureId) {
        Architecture arch = architectureRepository.findById(architectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Architecture not found: " + architectureId));
        projectService.findOwnedProject(arch.getProject().getId()); // throws 403 if not owned
        return arch;
    }

    /**
     * Verify that a given projectId is owned by the current user.
     */
    public void verifyProjectOwnership(Long projectId) {
        projectService.findOwnedProject(projectId);
    }

    /** Current user entity. */
    public User currentUser() {
        return securityHelper.getCurrentUser();
    }
}
