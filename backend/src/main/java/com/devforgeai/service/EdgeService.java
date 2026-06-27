package com.devforgeai.service;

import com.devforgeai.dto.CreateEdgeRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Edge;
import com.devforgeai.exception.ResourceNotFoundException;
import com.devforgeai.repository.EdgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EdgeService {

    private final EdgeRepository   edgeRepository;
    private final OwnershipService ownershipService;

    public Edge createEdge(CreateEdgeRequest request) {
        Architecture arch = ownershipService.verifyArchitectureOwnership(request.getArchitectureId());
        return edgeRepository.save(Edge.builder()
                .edgeKey(request.getEdgeKey())
                .sourceNode(request.getSourceNode())
                .targetNode(request.getTargetNode())
                .connectionName(request.getConnectionName())
                .protocol(request.getProtocol())
                .dataFormat(request.getDataFormat())
                .endpoints(request.getEndpoints())
                .description(request.getDescription())
                .architecture(arch)
                .build());
    }

    public List<Edge> getEdgesByArchitecture(Long architectureId) {
        ownershipService.verifyArchitectureOwnership(architectureId);
        return edgeRepository.findByArchitectureId(architectureId);
    }

    public Edge updateEdge(Long id, Map<String, Object> updates) {
        Edge edge = findOwnedEdge(id);
        if (updates.containsKey("connectionName")) edge.setConnectionName((String) updates.get("connectionName"));
        if (updates.containsKey("protocol"))       edge.setProtocol((String) updates.get("protocol"));
        if (updates.containsKey("dataFormat"))     edge.setDataFormat((String) updates.get("dataFormat"));
        if (updates.containsKey("endpoints"))      edge.setEndpoints((String) updates.get("endpoints"));
        if (updates.containsKey("description"))    edge.setDescription((String) updates.get("description"));
        if (updates.containsKey("edgeKey"))        edge.setEdgeKey((String) updates.get("edgeKey"));
        return edgeRepository.save(edge);
    }

    public void deleteEdge(Long id) {
        findOwnedEdge(id);
        edgeRepository.deleteById(id);
    }

    private Edge findOwnedEdge(Long id) {
        Edge edge = edgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Edge not found: " + id));
        ownershipService.verifyArchitectureOwnership(edge.getArchitecture().getId());
        return edge;
    }
}
