package com.devforgeai.repository;

import com.devforgeai.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {

    List<ProjectFile> findByProjectIdOrderByPathAsc(Long projectId);

    List<ProjectFile> findByProjectIdAndParentPathOrderByFolderDescNameAsc(Long projectId, String parentPath);

    Optional<ProjectFile> findByProjectIdAndPath(Long projectId, String path);

    @Query("SELECT f FROM ProjectFile f WHERE f.project.id = :projectId AND f.path LIKE CONCAT(:pathPrefix, '%')")
    List<ProjectFile> findByProjectIdAndPathStartingWith(Long projectId, String pathPrefix);

    void deleteByProjectIdAndPath(Long projectId, String path);
}
