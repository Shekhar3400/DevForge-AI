package com.devforgeai.service;

import com.devforgeai.dto.CreateModuleRequest;
import com.devforgeai.entity.Module;
import com.devforgeai.entity.Project;
import com.devforgeai.repository.ModuleRepository;
import com.devforgeai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final ProjectRepository projectRepository;

    public Module createModule(CreateModuleRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Module module = Module.builder()
                .name(request.getName())
                .project(project)
                .build();

        return moduleRepository.save(module);
    }

    public List<Module> getModulesByProject(Long projectId) {
        return moduleRepository.findByProjectId(projectId);
    }
}