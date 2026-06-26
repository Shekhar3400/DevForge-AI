package com.devforgeai.repository;

import com.devforgeai.entity.Edge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EdgeRepository extends JpaRepository<Edge, Long> {

    List<Edge> findByArchitectureId(Long architectureId);
}