package com.devforgeai.repository;

import com.devforgeai.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NodeRepository extends JpaRepository<Node, Long> {

    List<Node> findByArchitectureId(Long architectureId);
}