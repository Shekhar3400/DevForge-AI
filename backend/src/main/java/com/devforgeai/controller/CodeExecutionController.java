package com.devforgeai.controller;

import com.devforgeai.service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class CodeExecutionController {

    private final CodeExecutionService executionService;

    @PostMapping
    public CodeExecutionService.ExecutionResult execute(
            @RequestBody Map<String, String> body) {
        String language = body.getOrDefault("language", "javascript");
        String code     = body.getOrDefault("code", "");
        return executionService.execute(language, code);
    }
}
