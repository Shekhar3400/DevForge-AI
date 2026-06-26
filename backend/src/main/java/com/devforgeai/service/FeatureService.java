package com.devforgeai.service;

import com.devforgeai.dto.CreateFeatureRequest;
import com.devforgeai.entity.Feature;
import com.devforgeai.entity.Module;
import com.devforgeai.repository.FeatureRepository;
import com.devforgeai.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureService {

    private final FeatureRepository featureRepository;
    private final ModuleRepository moduleRepository;

    public Feature createFeature(CreateFeatureRequest request) {

        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));

        Feature feature = Feature.builder()
                .name(request.getName())
                .description(request.getDescription())
                .module(module)
                .build();

        return featureRepository.save(feature);
    }

    public List<Feature> getFeaturesByModule(Long moduleId) {
        return featureRepository.findByModuleId(moduleId);
    }

    public void deleteFeature(Long id) {
        featureRepository.deleteById(id);
    }
}