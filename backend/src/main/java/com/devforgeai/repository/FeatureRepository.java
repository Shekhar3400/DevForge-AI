package com.devforgeai.repository;

import com.devforgeai.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeatureRepository extends JpaRepository<Feature, Long> {

    List<Feature> findByModuleId(Long moduleId);
}