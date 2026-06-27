package com.devforgeai.repository;

import com.devforgeai.entity.NodeFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NodeFeatureRepository extends JpaRepository<NodeFeature, Long> {
    List<NodeFeature> findByNodeModuleId(Long nodeModuleId);
}
