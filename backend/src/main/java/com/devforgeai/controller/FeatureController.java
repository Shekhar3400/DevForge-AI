package com.devforgeai.controller;

import com.devforgeai.dto.CreateFeatureRequest;
import com.devforgeai.entity.Feature;
import com.devforgeai.service.FeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureService featureService;

    @PostMapping
    public Feature createFeature(
            @RequestBody CreateFeatureRequest request) {

        return featureService.createFeature(request);
    }

    @GetMapping("/module/{moduleId}")
    public List<Feature> getFeaturesByModule(
            @PathVariable Long moduleId) {

        return featureService.getFeaturesByModule(moduleId);
    }

    @DeleteMapping("/{id}")
    public void deleteFeature(
            @PathVariable Long id) {

        featureService.deleteFeature(id);
    }
}