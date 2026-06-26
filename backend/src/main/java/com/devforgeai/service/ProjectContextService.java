package com.devforgeai.service;

import com.devforgeai.entity.Edge;
import com.devforgeai.entity.Feature;
import com.devforgeai.entity.Module;
import com.devforgeai.entity.Node;
import com.devforgeai.entity.Project;
import com.devforgeai.entity.ProjectContext;
import com.devforgeai.repository.EdgeRepository;
import com.devforgeai.repository.FeatureRepository;
import com.devforgeai.repository.ModuleRepository;
import com.devforgeai.repository.NodeRepository;
import com.devforgeai.repository.ProjectContextRepository;
import com.devforgeai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectContextService {

    private final ProjectRepository projectRepository;
    private final ProjectContextRepository projectContextRepository;

    private final ModuleRepository moduleRepository;
    private final FeatureRepository featureRepository;

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    public String getProjectContext(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        ProjectContext context =
                projectContextRepository.findByProject(project)
                        .orElse(null);

        if (context == null) {

            String generatedContext =
                    generateContext(project);

            context =
                    ProjectContext.builder()
                            .project(project)
                            .contextJson(generatedContext)
                            .build();

            projectContextRepository.save(context);
        }

        return context.getContextJson();
    }

    public String regenerateContext(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        String generatedContext =
                generateContext(project);

        ProjectContext context =
                projectContextRepository.findByProject(project)
                        .orElse(
                                ProjectContext.builder()
                                        .project(project)
                                        .build()
                        );

        context.setContextJson(generatedContext);

        projectContextRepository.save(context);

        return generatedContext;
    }

    private String generateContext(Project project) {

        List<Module> modules =
                moduleRepository.findByProjectId(
                        project.getId());

        List<String> moduleNames =
                modules.stream()
                        .map(Module::getName)
                        .collect(Collectors.toList());

        List<String> featureNames =
                modules.stream()
                        .flatMap(module ->
                                featureRepository
                                        .findByModuleId(module.getId())
                                        .stream())
                        .map(Feature::getName)
                        .collect(Collectors.toList());

        // Architecture 1 currently belongs to your project
        List<Node> nodes =
                nodeRepository.findByArchitectureId(1L);

        List<Edge> edges =
                edgeRepository.findByArchitectureId(1L);

        List<String> nodeNames =
                nodes.stream()
                        .map(Node::getLabel)
                        .collect(Collectors.toList());

        List<String> edgeNames =
                edges.stream()
                        .map(Edge::getEdgeKey)
                        .collect(Collectors.toList());

        return """
                {
                  "projectName":"%s",
                  "modules":%s,
                  "features":%s,
                  "nodes":%s,
                  "edges":%s
                }
                """.formatted(
                project.getName(),
                moduleNames,
                featureNames,
                nodeNames,
                edgeNames
        );
    }
}