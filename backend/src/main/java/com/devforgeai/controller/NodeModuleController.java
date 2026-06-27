package com.devforgeai.controller;

import com.devforgeai.entity.NodeFeature;
import com.devforgeai.entity.NodeModule;
import com.devforgeai.service.NodeModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/node-modules")
@RequiredArgsConstructor
public class NodeModuleController {

    private final NodeModuleService service;

    @PostMapping("/node/{nodeId}")
    public NodeModule create(@PathVariable Long nodeId, @RequestBody Map<String,String> body) {
        return service.createModule(nodeId, body.get("name"));
    }

    @GetMapping("/node/{nodeId}")
    public List<NodeModule> getByNode(@PathVariable Long nodeId) {
        return service.getModules(nodeId);
    }

    @PatchMapping("/{id}")
    public NodeModule rename(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return service.renameModule(id, body.get("name"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteModule(id);
    }

    @PostMapping("/{moduleId}/features")
    public NodeFeature createFeature(@PathVariable Long moduleId, @RequestBody Map<String,String> body) {
        return service.createFeature(moduleId, body.get("name"), body.getOrDefault("description", ""));
    }

    @GetMapping("/{moduleId}/features")
    public List<NodeFeature> getFeatures(@PathVariable Long moduleId) {
        return service.getFeatures(moduleId);
    }

    @PatchMapping("/features/{id}")
    public NodeFeature renameFeature(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return service.renameFeature(id, body.get("name"), body.getOrDefault("description", null));
    }

    @DeleteMapping("/features/{id}")
    public void deleteFeature(@PathVariable Long id) {
        service.deleteFeature(id);
    }
}
