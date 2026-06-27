package com.devforgeai.repository;

import com.devforgeai.entity.NodeModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NodeModuleRepository extends JpaRepository<NodeModule, Long> {
    List<NodeModule> findByNodeId(Long nodeId);
}
