package com.devforgeai.service;

import com.devforgeai.entity.Node;
import com.devforgeai.entity.NodeFeature;
import com.devforgeai.entity.NodeModule;
import com.devforgeai.repository.NodeFeatureRepository;
import com.devforgeai.repository.NodeModuleRepository;
import com.devforgeai.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NodeModuleService {

    private final NodeRepository        nodeRepository;
    private final NodeModuleRepository  nodeModuleRepository;
    private final NodeFeatureRepository nodeFeatureRepository;
    private final ProjectService        projectService;

    /** Verify the node's architecture chain belongs to the current user */
    private void verifyNodeOwnership(Node node) {
        if (node.getArchitecture() != null && node.getArchitecture().getProject() != null) {
            projectService.findOwnedProject(node.getArchitecture().getProject().getId());
        }
    }

    public NodeModule createModule(Long nodeId, String name) {
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("Node not found"));
        verifyNodeOwnership(node);
        return nodeModuleRepository.save(
                NodeModule.builder().name(name).node(node).build());
    }

    public List<NodeModule> getModules(Long nodeId) {
        Node node = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("Node not found"));
        verifyNodeOwnership(node);
        return nodeModuleRepository.findByNodeId(nodeId);
    }

    public NodeModule renameModule(Long id, String name) {
        NodeModule module = nodeModuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        module.setName(name);
        return nodeModuleRepository.save(module);
    }

    public void deleteModule(Long id) {
        nodeModuleRepository.deleteById(id);
    }

    public NodeFeature createFeature(Long moduleId, String name, String description) {
        NodeModule module = nodeModuleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        return nodeFeatureRepository.save(
                NodeFeature.builder().name(name).description(description).nodeModule(module).build());
    }

    public List<NodeFeature> getFeatures(Long moduleId) {
        return nodeFeatureRepository.findByNodeModuleId(moduleId);
    }

    public NodeFeature renameFeature(Long id, String name, String description) {
        NodeFeature feature = nodeFeatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feature not found"));
        if (name != null) feature.setName(name);
        if (description != null) feature.setDescription(description);
        return nodeFeatureRepository.save(feature);
    }

    public void deleteFeature(Long id) {
        nodeFeatureRepository.deleteById(id);
    }
}
