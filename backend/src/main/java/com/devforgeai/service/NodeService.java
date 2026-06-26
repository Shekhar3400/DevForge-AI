package com.devforgeai.service;

import com.devforgeai.dto.CreateNodeRequest;
import com.devforgeai.entity.Architecture;
import com.devforgeai.entity.Node;
import com.devforgeai.repository.ArchitectureRepository;
import com.devforgeai.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final ArchitectureRepository architectureRepository;

    public Node createNode(CreateNodeRequest request) {

        Architecture architecture = architectureRepository.findById(request.getArchitectureId())
                .orElseThrow(() -> new RuntimeException("Architecture not found"));

        Node node = Node.builder()
                .nodeKey(request.getNodeKey())
                .label(request.getLabel())
                .type(request.getType())
                .positionX(request.getPositionX())
                .positionY(request.getPositionY())
                .architecture(architecture)
                .build();

        return nodeRepository.save(node);
    }

    public List<Node> getNodesByArchitecture(Long architectureId) {
        return nodeRepository.findByArchitectureId(architectureId);
    }

    public void deleteNode(Long id) {
        nodeRepository.deleteById(id);
    }
}