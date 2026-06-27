package com.devforgeai.service;

import com.devforgeai.dto.CreateNodeRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Node;
import com.devforgeai.exception.ForbiddenException;
import com.devforgeai.exception.ResourceNotFoundException;
import com.devforgeai.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository     nodeRepository;
    private final OwnershipService   ownershipService;

    public Node createNode(CreateNodeRequest request) {
        Architecture arch = ownershipService.verifyArchitectureOwnership(request.getArchitectureId());
        return nodeRepository.save(Node.builder()
                .nodeKey(request.getNodeKey())
                .label(request.getLabel())
                .type(request.getType())
                .technology(request.getTechnology())
                .framework(request.getFramework())
                .positionX(request.getPositionX())
                .positionY(request.getPositionY())
                .architecture(arch)
                .build());
    }

    public List<Node> getNodesByArchitecture(Long architectureId) {
        ownershipService.verifyArchitectureOwnership(architectureId);
        return nodeRepository.findByArchitectureId(architectureId);
    }

    public Node updateNode(Long id, Map<String, Object> updates) {
        Node node = findOwnedNode(id);
        if (updates.containsKey("label"))      node.setLabel((String) updates.get("label"));
        if (updates.containsKey("type"))       node.setType((String) updates.get("type"));
        if (updates.containsKey("technology")) node.setTechnology((String) updates.get("technology"));
        if (updates.containsKey("framework"))  node.setFramework((String) updates.get("framework"));
        if (updates.containsKey("positionX"))  node.setPositionX(((Number) updates.get("positionX")).doubleValue());
        if (updates.containsKey("positionY"))  node.setPositionY(((Number) updates.get("positionY")).doubleValue());
        return nodeRepository.save(node);
    }

    public void deleteNode(Long id) {
        findOwnedNode(id);
        nodeRepository.deleteById(id);
    }

    private Node findOwnedNode(Long id) {
        Node node = nodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Node not found: " + id));
        ownershipService.verifyArchitectureOwnership(node.getArchitecture().getId());
        return node;
    }
}
