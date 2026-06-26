package com.devforgeai.service;

import com.devforgeai.dto.CreateArchitectureRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Project;
import com.devforgeai.repository.ArchitectureRepository;
import com.devforgeai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArchitectureService {

    private final ArchitectureRepository architectureRepository;
    private final ProjectRepository projectRepository;

    public Architecture createArchitecture(CreateArchitectureRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Architecture architecture = Architecture.builder()
                .name(request.getName())
                .project(project)
                .build();

        return architectureRepository.save(architecture);
    }

    public List<Architecture> getArchitecturesByProject(Long projectId) {
        return architectureRepository.findByProjectId(projectId);
    }
}