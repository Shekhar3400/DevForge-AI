package com.devforgeai.controller;

import com.devforgeai.dto.CreateEdgeRequest;
import com.devforgeai.entity.Edge;
import com.devforgeai.service.EdgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/edges")
@RequiredArgsConstructor
public class EdgeController {

    private final EdgeService edgeService;

    @PostMapping
    public Edge createEdge(@RequestBody CreateEdgeRequest request) {
        return edgeService.createEdge(request);
    }

    @GetMapping("/architecture/{architectureId}")
    public List<Edge> getEdgesByArchitecture(@PathVariable Long architectureId) {
        return edgeService.getEdgesByArchitecture(architectureId);
    }

    @PatchMapping("/{id}")
    public Edge updateEdge(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return edgeService.updateEdge(id, updates);
    }

    @DeleteMapping("/{id}")
    public void deleteEdge(@PathVariable Long id) {
        edgeService.deleteEdge(id);
    }
}
