package com.devforgeai.repository;

import com.devforgeai.entity.Project;
import com.devforgeai.entity.ProjectContext;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectContextRepository
        extends JpaRepository<ProjectContext, Long> {

    Optional<ProjectContext> findByProject(Project project);
}