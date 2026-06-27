package com.devforgeai.service;

import com.devforgeai.entity.*;
import com.devforgeai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectContextService {

    private final ProjectRepository        projectRepository;
    private final ProjectContextRepository projectContextRepository;
    private final ModuleRepository         moduleRepository;
    private final FeatureRepository        featureRepository;
    private final NodeRepository           nodeRepository;
    private final EdgeRepository           edgeRepository;
    private final ArchitectureRepository   architectureRepository;
    private final NodeModuleRepository     nodeModuleRepository;
    private final NodeFeatureRepository    nodeFeatureRepository;
    private final ProjectFileRepository    projectFileRepository;

    public String getProjectContext(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        ProjectContext ctx = projectContextRepository.findByProject(project).orElse(null);
        if (ctx == null) {
            String generated = generateContext(project);
            ctx = ProjectContext.builder().project(project).contextJson(generated).build();
            projectContextRepository.save(ctx);
        }
        return ctx.getContextJson();
    }

    public String regenerateContext(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        String generated = generateContext(project);
        ProjectContext ctx = projectContextRepository.findByProject(project)
                .orElse(ProjectContext.builder().project(project).build());
        ctx.setContextJson(generated);
        projectContextRepository.save(ctx);
        return generated;
    }

    private String generateContext(Project project) {
        // Get project's architectures (use first one if available)
        List<Architecture> archs = architectureRepository.findByProjectId(project.getId());
        Long archId = archs.isEmpty() ? null : archs.get(0).getId();

        // Nodes with their modules + features
        List<Node> nodes = archId != null ? nodeRepository.findByArchitectureId(archId) : List.of();
        List<Edge> edges = archId != null ? edgeRepository.findByArchitectureId(archId) : List.of();

        // Build node summaries
        StringBuilder nodesSb = new StringBuilder("[");
        for (int i = 0; i < nodes.size(); i++) {
            Node n = nodes.get(i);
            List<NodeModule> mods = nodeModuleRepository.findByNodeId(n.getId());
            StringBuilder modsSb = new StringBuilder("[");
            for (int j = 0; j < mods.size(); j++) {
                NodeModule m = mods.get(j);
                List<NodeFeature> feats = nodeFeatureRepository.findByNodeModuleId(m.getId());
                List<String> featNames = feats.stream().map(NodeFeature::getName).collect(Collectors.toList());
                modsSb.append("{\"name\":\"").append(esc(m.getName())).append("\",\"features\":")
                      .append(toJsonArray(featNames)).append("}");
                if (j < mods.size() - 1) modsSb.append(",");
            }
            modsSb.append("]");
            nodesSb.append("{\"id\":").append(n.getId())
                   .append(",\"label\":\"").append(esc(n.getLabel())).append("\"")
                   .append(",\"type\":\"").append(esc(n.getType())).append("\"")
                   .append(",\"technology\":\"").append(esc(n.getTechnology())).append("\"")
                   .append(",\"framework\":\"").append(esc(n.getFramework())).append("\"")
                   .append(",\"modules\":").append(modsSb).append("}");
            if (i < nodes.size() - 1) nodesSb.append(",");
        }
        nodesSb.append("]");

        // Build edge summaries
        List<String> edgeSummaries = edges.stream()
                .map(e -> e.getSourceNode() + "->" + e.getTargetNode()
                        + (e.getProtocol() != null ? "[" + e.getProtocol() + "]" : ""))
                .collect(Collectors.toList());

        // Project files summary
        List<ProjectFile> files = projectFileRepository.findByProjectIdOrderByPathAsc(project.getId());
        List<String> filePaths = files.stream()
                .filter(f -> !f.isFolder())
                .map(ProjectFile::getPath)
                .limit(50)
                .collect(Collectors.toList());

        return """
                {
                  "projectId": %d,
                  "projectName": "%s",
                  "description": "%s",
                  "architectureId": %s,
                  "nodes": %s,
                  "edges": %s,
                  "files": %s,
                  "fileCount": %d
                }
                """.formatted(
                project.getId(),
                esc(project.getName()),
                esc(project.getDescription() != null ? project.getDescription() : ""),
                archId != null ? archId.toString() : "null",
                nodesSb.toString(),
                toJsonArray(edgeSummaries),
                toJsonArray(filePaths),
                filePaths.size()
        );
    }

    private String toJsonArray(List<String> items) {
        if (items == null || items.isEmpty()) return "[]";
        return "[" + items.stream().map(s -> "\"" + esc(s) + "\"").collect(Collectors.joining(",")) + "]";
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
