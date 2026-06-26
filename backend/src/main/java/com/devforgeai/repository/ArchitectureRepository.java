package com.devforgeai.repository;

import com.devforgeai.entity.Architecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArchitectureRepository extends JpaRepository<Architecture, Long> {

    List<Architecture> findByProjectId(Long projectId);
}