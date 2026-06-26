package com.devforgeai.service;

import com.devforgeai.dto.CreateEdgeRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Edge;
import com.devforgeai.repository.ArchitectureRepository;
import com.devforgeai.repository.EdgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EdgeService {

    private final EdgeRepository edgeRepository;
    private final ArchitectureRepository architectureRepository;

    public Edge createEdge(CreateEdgeRequest request) {

        Architecture architecture = architectureRepository.findById(request.getArchitectureId())
                .orElseThrow(() -> new RuntimeException("Architecture not found"));

        Edge edge = Edge.builder()
                .edgeKey(request.getEdgeKey())
                .sourceNode(request.getSourceNode())
                .targetNode(request.getTargetNode())
                .architecture(architecture)
                .build();

        return edgeRepository.save(edge);
    }

    public List<Edge> getEdgesByArchitecture(Long architectureId) {
        return edgeRepository.findByArchitectureId(architectureId);
    }

    public void deleteEdge(Long id) {
        edgeRepository.deleteById(id);
    }
}