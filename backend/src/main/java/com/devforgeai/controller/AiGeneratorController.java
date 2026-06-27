package com.devforgeai.controller;

import com.devforgeai.service.AiProjectGeneratorService;
import com.devforgeai.service.ProjectFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-generator")
@RequiredArgsConstructor
public class AiGeneratorController {

    private final AiProjectGeneratorService generatorService;

    /** Full AI workflow: analyze → design → connect → generate files */
    @PostMapping("/full")
    public Map<String, Object> fullGenerate(@RequestBody Map<String, Object> body) {
        Long   projectId      = toLong(body.get("projectId"));
        Long   architectureId = toLong(body.get("architectureId"));
        String prompt         = str(body, "prompt");
        String projectName    = str(body, "projectName");
        List<Map<String,Object>> existingFiles = castList(body.get("existingFiles"));
        return generatorService.fullGenerate(projectId, architectureId, prompt, projectName, existingFiles);
    }

    /** Architecture-only generation */
    @PostMapping("/architecture")
    public Map<String, Object> generateArchitecture(@RequestBody Map<String, Object> body) {
        Long   projectId      = toLong(body.get("projectId"));
        Long   architectureId = toLong(body.get("architectureId"));
        String description    = str(body, "description");
        return generatorService.generateArchitecture(projectId, architectureId, description, null);
    }

    /** Auto-connect existing nodes */
    @PostMapping("/connect")
    public List<Map<String,Object>> autoConnect(@RequestBody Map<String, Object> body) {
        Long architectureId = toLong(body.get("architectureId"));
        Map<String,Object> archResult = castMap(body.get("archResult"));
        return generatorService.autoConnectNodes(architectureId, archResult);
    }

    /** File structure generation */
    @PostMapping("/files")
    public List<Map<String, Object>> generateFiles(@RequestBody Map<String, Object> body) {
        Long   projectId   = toLong(body.get("projectId"));
        String description = str(body, "description");
        String stack       = str(body, "stack");
        List<String> existing = castStrList(body.get("existingFiles"));
        Map<String,Object> analysis = Map.of("existingFiles", existing, "frameworks", List.of(), "languages", List.of(), "summary", "");
        return generatorService.generateFiles(projectId, description, stack, analysis);
    }

    /** Project analyzer */
    @PostMapping("/analyze")
    public Map<String, Object> analyzeProject(@RequestBody Map<String, Object> body) {
        Long   projectId      = toLong(body.get("projectId"));
        List<Map<String,Object>> files = castList(body.get("files"));
        return generatorService.analyzeProject(projectId, files);
    }

    /** Smart file code generation — modify or create */
    @PostMapping("/file-code")
    public Map<String, String> generateFileCode(@RequestBody Map<String, Object> body) {
        Long   projectId      = toLong(body.get("projectId"));
        Long   fileId         = body.get("fileId") != null ? toLong(body.get("fileId")) : null;
        String filePath       = str(body, "filePath");
        String currentContent = str(body, "currentContent");
        String instruction    = str(body, "context");
        if (instruction == null || instruction.isBlank()) instruction = str(body, "instruction");
        String code = generatorService.generateFileCode(projectId, fileId, filePath, currentContent, instruction);
        return Map.of("code", code);
    }

    // ── helpers ─────────────────────────────────────────────────────────────
    private Long toLong(Object v) {
        if (v == null) return null;
        return Long.valueOf(String.valueOf(v).split("\\.")[0]);
    }
    private String str(Map<String,Object> m, String k) {
        Object v = m == null ? null : m.get(k);
        return v == null || "null".equals(String.valueOf(v)) ? "" : String.valueOf(v);
    }
    @SuppressWarnings("unchecked")
    private List<Map<String,Object>> castList(Object o) {
        return o instanceof List ? (List<Map<String,Object>>)o : java.util.Collections.emptyList();
    }
    @SuppressWarnings("unchecked")
    private Map<String,Object> castMap(Object o) {
        return o instanceof Map ? (Map<String,Object>)o : new java.util.HashMap<>();
    }
    @SuppressWarnings("unchecked")
    private List<String> castStrList(Object o) {
        if (!(o instanceof List)) return java.util.Collections.emptyList();
        return ((List<?>)o).stream().map(String::valueOf).collect(java.util.stream.Collectors.toList());
    }
}
