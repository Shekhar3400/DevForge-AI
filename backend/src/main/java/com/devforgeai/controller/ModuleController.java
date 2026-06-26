package com.devforgeai.controller;

import com.devforgeai.dto.CreateModuleRequest;
import com.devforgeai.entity.Module;
import com.devforgeai.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public Module createModule(
            @RequestBody CreateModuleRequest request) {

        return moduleService.createModule(request);
    }

    @GetMapping("/project/{projectId}")
    public List<Module> getModulesByProject(
            @PathVariable Long projectId) {

        return moduleService.getModulesByProject(projectId);
    }
}