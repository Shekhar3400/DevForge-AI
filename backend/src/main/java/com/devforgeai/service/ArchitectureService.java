package com.devforgeai.service;

import com.devforgeai.dto.CreateArchitectureRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Project;
import com.devforgeai.repository.ArchitectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArchitectureService {

    private final ArchitectureRepository architectureRepository;
    private final ProjectService         projectService; // owns ownership check

    public Architecture createArchitecture(CreateArchitectureRequest request) {
        Project project = projectService.findOwnedProject(request.getProjectId());
        return architectureRepository.save(
                Architecture.builder().name(request.getName()).project(project).build());
    }

    public List<Architecture> getArchitecturesByProject(Long projectId) {
        projectService.findOwnedProject(projectId); // ownership check
        return architectureRepository.findByProjectId(projectId);
    }
}
