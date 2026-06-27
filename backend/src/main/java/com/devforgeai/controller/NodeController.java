package com.devforgeai.controller;

import com.devforgeai.dto.CreateNodeRequest;
import com.devforgeai.entity.Node;
import com.devforgeai.service.NodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @PostMapping
    public Node createNode(@RequestBody CreateNodeRequest request) {
        return nodeService.createNode(request);
    }

    @GetMapping("/architecture/{architectureId}")
    public List<Node> getNodesByArchitecture(@PathVariable Long architectureId) {
        return nodeService.getNodesByArchitecture(architectureId);
    }

    @PatchMapping("/{id}")
    public Node updateNode(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return nodeService.updateNode(id, updates);
    }

    @DeleteMapping("/{id}")
    public void deleteNode(@PathVariable Long id) {
        nodeService.deleteNode(id);
    }
}