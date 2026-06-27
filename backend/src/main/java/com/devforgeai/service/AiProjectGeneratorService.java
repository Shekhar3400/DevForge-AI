package com.devforgeai.service;

import com.devforgeai.aigateway.models.ChatMessage;
import com.devforgeai.aigateway.providers.OpenRouterProvider;
import com.devforgeai.entity.*;
import com.devforgeai.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiProjectGeneratorService {

    private final OpenRouterProvider     openRouter;
    private final ProjectFileService     fileService;
    private final ProjectFileRepository  fileRepository;
    private final ArchitectureRepository archRepository;
    private final NodeRepository         nodeRepository;
    private final NodeModuleRepository   nodeModuleRepository;
    private final NodeFeatureRepository  nodeFeatureRepository;
    private final EdgeRepository         edgeRepository;
    private final ObjectMapper           objectMapper;

    // ── FULL AI WORKFLOW ─────────────────────────────────────────────────────

    /**
     * Full end-to-end AI software engineering workflow:
     * Analyze → Plan → Design Architecture → Generate Files → Generate Code
     */
    @Transactional
    public Map<String, Object> fullGenerate(Long projectId, Long architectureId, String userPrompt,
                                             String projectName, List<Map<String,Object>> existingFiles) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<String> steps = new ArrayList<>();

        // STEP 1: Analyze existing project
        steps.add("Analyzing existing project...");
        Map<String, Object> analysis = analyzeProject(projectId, existingFiles);
        result.put("analysis", analysis);
        steps.add("✔ Project analyzed — " + analysis.get("summary"));

        // STEP 2: Design architecture
        steps.add("Designing system architecture...");
        Map<String, Object> archResult = generateArchitecture(projectId, architectureId, userPrompt, analysis);
        result.put("architecture", archResult);
        steps.add("✔ Architecture designed — " + countNodes(archResult) + " nodes created");

        // STEP 3: Auto-connect nodes
        steps.add("Auto-connecting nodes...");
        List<Map<String,Object>> edges = autoConnectNodes(architectureId, archResult);
        result.put("edges", edges);
        steps.add("✔ Nodes connected — " + edges.size() + " connections");

        // STEP 4: Generate file structure
        steps.add("Generating project structure...");
        String stack = detectStack(analysis, archResult);
        List<Map<String,Object>> files = generateFiles(projectId, userPrompt, stack, analysis);
        result.put("files", files);
        steps.add("✔ Files created — " + files.size() + " items");

        steps.add("✔ Completed");
        result.put("steps", steps);
        result.put("stack", stack);
        return result;
    }

    // ── PROJECT ANALYZER ─────────────────────────────────────────────────────

    public Map<String, Object> analyzeProject(Long projectId, List<Map<String,Object>> existingFiles) {
        Map<String, Object> analysis = new LinkedHashMap<>();
        if (existingFiles == null) existingFiles = new ArrayList<>();

        List<String> paths = existingFiles.stream()
                .map(f -> String.valueOf(f.getOrDefault("path", "")))
                .filter(p -> !p.isBlank()).collect(Collectors.toList());

        // Detect framework/language from file extensions and names
        boolean hasJava     = paths.stream().anyMatch(p -> p.endsWith(".java"));
        boolean hasTs       = paths.stream().anyMatch(p -> p.endsWith(".ts") || p.endsWith(".tsx"));
        boolean hasJs       = paths.stream().anyMatch(p -> p.endsWith(".js") || p.endsWith(".jsx"));
        boolean hasPy       = paths.stream().anyMatch(p -> p.endsWith(".py"));
        boolean hasSpring   = paths.stream().anyMatch(p -> p.contains("pom.xml") || p.contains("application.properties"));
        boolean hasReact    = paths.stream().anyMatch(p -> p.contains("App.jsx") || p.contains("App.tsx") || p.contains("vite.config"));
        boolean hasPackage  = paths.stream().anyMatch(p -> p.endsWith("package.json"));

        List<String> detectedFrameworks = new ArrayList<>();
        List<String> detectedLanguages  = new ArrayList<>();
        if (hasSpring)  detectedFrameworks.add("Spring Boot");
        if (hasReact)   detectedFrameworks.add("React");
        if (hasJava)    detectedLanguages.add("Java");
        if (hasTs)      detectedLanguages.add("TypeScript");
        if (hasJs)      detectedLanguages.add("JavaScript");
        if (hasPy)      detectedLanguages.add("Python");

        // Categorize existing files
        List<String> controllers = paths.stream().filter(p -> p.toLowerCase().contains("controller")).collect(Collectors.toList());
        List<String> services    = paths.stream().filter(p -> p.toLowerCase().contains("service")).collect(Collectors.toList());
        List<String> entities    = paths.stream().filter(p -> p.toLowerCase().contains("entity") || p.toLowerCase().contains("model")).collect(Collectors.toList());
        List<String> components  = paths.stream().filter(p -> p.toLowerCase().contains("component")).collect(Collectors.toList());
        List<String> pages       = paths.stream().filter(p -> p.toLowerCase().contains("page") || p.toLowerCase().contains("pages")).collect(Collectors.toList());

        analysis.put("frameworks",   detectedFrameworks);
        analysis.put("languages",    detectedLanguages);
        analysis.put("existingFiles", paths);
        analysis.put("fileCount",    paths.size());
        analysis.put("controllers",  controllers);
        analysis.put("services",     services);
        analysis.put("entities",     entities);
        analysis.put("components",   components);
        analysis.put("pages",        pages);
        analysis.put("hasBackend",   hasJava || hasSpring || hasPy);
        analysis.put("hasFrontend",  hasReact || hasTs || hasJs);
        analysis.put("summary",      (paths.isEmpty() ? "new project" :
                paths.size() + " existing files, frameworks: " + detectedFrameworks));
        return analysis;
    }

    // ── ARCHITECTURE GENERATOR ───────────────────────────────────────────────

    @Transactional
    public Map<String, Object> generateArchitecture(Long projectId, Long architectureId,
                                                     String description, Map<String,Object> analysis) {
        Architecture arch = archRepository.findById(architectureId)
                .orElseThrow(() -> new RuntimeException("Architecture not found"));

        String prompt = buildArchPrompt(description, analysis);
        String raw    = callAi(prompt);
        String json   = extractJson(raw);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("raw", raw);

        try {
            Map<String, Object> parsed = objectMapper.readValue(json, new TypeReference<>(){});
            List<Map<String,Object>> nodes = cast(parsed.get("nodes"));
            if (nodes == null) nodes = new ArrayList<>();

            List<Map<String,Object>> createdNodes = new ArrayList<>();
            double x = 120, y = 100;
            for (Map<String,Object> n : nodes) {
                Node node = nodeRepository.save(Node.builder()
                        .nodeKey(slug(str(n,"label")) + "-" + System.currentTimeMillis())
                        .label(str(n,"label"))
                        .type(str(n,"type","Backend"))
                        .technology(str(n,"technology",""))
                        .framework(str(n,"framework",""))
                        .positionX(x).positionY(y)
                        .architecture(arch).build());
                x += 240; if (x > 960) { x = 120; y += 180; }

                // Create modules with features
                List<Map<String,Object>> moduleDefs = castModules(n.get("modules"));
                for (Map<String,Object> md : moduleDefs) {
                    NodeModule mod = nodeModuleRepository.save(
                            NodeModule.builder().name(str(md,"name")).node(node).build());
                    List<String> featNames = castStrList(md.get("features"));
                    for (String fn : featNames) {
                        nodeFeatureRepository.save(NodeFeature.builder()
                                .name(fn).nodeModule(mod).build());
                    }
                }
                Map<String,Object> nm = new LinkedHashMap<>(n);
                nm.put("id", node.getId());
                nm.put("nodeKey", node.getNodeKey());
                createdNodes.add(nm);
            }
            result.put("nodes", createdNodes);
            result.put("nodeCount", createdNodes.size());
        } catch (Exception e) {
            log.warn("[AiGenerator] Architecture parse failed: {}", e.getMessage());
            result.put("error", "Could not parse architecture JSON: " + e.getMessage());
            result.put("nodes", new ArrayList<>());
        }
        return result;
    }

    // ── AUTO NODE CONNECTOR ──────────────────────────────────────────────────

    @Transactional
    public List<Map<String,Object>> autoConnectNodes(Long architectureId, Map<String,Object> archResult) {
        Architecture arch = archRepository.findById(architectureId)
                .orElseThrow(() -> new RuntimeException("Architecture not found"));

        List<Map<String,Object>> nodes = cast(archResult.get("nodes"));
        if (nodes == null || nodes.size() < 2) return new ArrayList<>();

        // Ask AI to define connections
        String prompt = buildConnectionPrompt(nodes);
        String raw    = callAi(prompt);
        String json   = extractJson(raw);

        List<Map<String,Object>> created = new ArrayList<>();
        try {
            List<Map<String,Object>> connections = objectMapper.readValue(json, new TypeReference<>(){});
            for (Map<String,Object> conn : connections) {
                String srcLabel = str(conn, "source");
                String tgtLabel = str(conn, "target");
                // Find node IDs by label
                Long srcId = findNodeId(nodes, srcLabel);
                Long tgtId = findNodeId(nodes, tgtLabel);
                if (srcId == null || tgtId == null) continue;

                Edge edge = edgeRepository.save(Edge.builder()
                        .edgeKey("edge-" + srcId + "-" + tgtId + "-" + System.currentTimeMillis())
                        .sourceNode(String.valueOf(srcId))
                        .targetNode(String.valueOf(tgtId))
                        .connectionName(str(conn,"connectionName","Connection"))
                        .protocol(str(conn,"protocol","REST"))
                        .dataFormat(str(conn,"dataFormat","JSON"))
                        .description(str(conn,"description",""))
                        .architecture(arch).build());

                Map<String,Object> m = new LinkedHashMap<>();
                m.put("id", edge.getId());
                m.put("source", String.valueOf(srcId));
                m.put("target", String.valueOf(tgtId));
                m.put("edgeKey", edge.getEdgeKey());
                m.put("connectionName", edge.getConnectionName());
                m.put("protocol", edge.getProtocol());
                created.add(m);
            }
        } catch (Exception e) {
            log.warn("[AiGenerator] Connection parse failed: {}", e.getMessage());
        }
        return created;
    }

    // ── FILE GENERATOR ───────────────────────────────────────────────────────

    @Transactional
    public List<Map<String,Object>> generateFiles(Long projectId, String description,
                                                   String stack, Map<String,Object> analysis) {
        List<String> existingPaths = analysis != null ? castStrList(analysis.get("existingFiles")) : new ArrayList<>();
        String prompt = buildFilePrompt(description, stack, existingPaths);
        String raw    = callAi(prompt);
        String json   = extractJson(raw);

        try {
            List<Map<String,Object>> files = objectMapper.readValue(json, new TypeReference<>(){});
            // Filter: don't overwrite existing files unless content is explicitly new
            List<Map<String,Object>> toCreate = files.stream().filter(f -> {
                String path = str(f, "path");
                return !existingPaths.contains(path);
            }).collect(Collectors.toList());
            fileService.bulkCreate(projectId, toCreate);
            return toCreate;
        } catch (Exception e) {
            log.warn("[AiGenerator] File parse failed: {}", e.getMessage());
            return buildDefaultStructure(projectId, stack);
        }
    }

    /** Generate code for a specific existing file — project-aware, never blindly regenerates */
    @Transactional
    public String generateFileCode(Long projectId, Long fileId, String filePath,
                                    String currentContent, String userInstruction) {
        String lang    = ProjectFileService.detectLanguage(filePath);
        boolean hasContent = currentContent != null && !currentContent.isBlank();

        String prompt;
        if (hasContent && userInstruction != null && !userInstruction.isBlank()) {
            // Modify existing file
            prompt = """
You are an expert software engineer. The user wants to modify an existing file.

File: %s
Language: %s
User instruction: %s

Current file content:
```%s
%s
```

IMPORTANT:
- Only modify what the instruction requires
- Keep all existing functionality intact
- Return ONLY the complete updated file content, no markdown fences, no explanation
""".formatted(filePath, lang, userInstruction, lang, currentContent);
        } else {
            // Generate new file
            prompt = """
You are an expert software engineer. Generate production-quality code for:

File: %s
Language: %s
%s

Return ONLY the code, no markdown fences, no explanation.
""".formatted(filePath, lang, userInstruction != null ? "Context: " + userInstruction : "");
        }

        String code = callAi(prompt);
        code = stripFences(code);
        if (fileId != null) fileService.updateContent(fileId, code);
        return code;
    }

    // ── PROMPT BUILDERS ──────────────────────────────────────────────────────

    private String buildArchPrompt(String description, Map<String,Object> analysis) {
        String existing = analysis != null ? String.valueOf(analysis.getOrDefault("summary","")) : "";
        return """
You are an expert software architect. Design a complete system architecture.

User request: "%s"
Existing project: %s

Generate ONLY valid JSON (no markdown):
{
  "nodes": [
    {
      "label": "Frontend",
      "type": "Frontend",
      "technology": "React",
      "framework": "Vite",
      "description": "User interface layer",
      "modules": [
        {"name": "Authentication", "features": ["Login", "Register", "JWT Refresh"]},
        {"name": "Dashboard", "features": ["Overview", "Analytics", "Activity Feed"]}
      ]
    },
    {
      "label": "Backend",
      "type": "Backend",
      "technology": "Java",
      "framework": "Spring Boot",
      "description": "REST API layer",
      "modules": [
        {"name": "Auth Module", "features": ["JWT Token", "OAuth2", "Password Hash"]},
        {"name": "Core API", "features": ["CRUD Operations", "Validation", "Error Handling"]}
      ]
    }
  ]
}

Rules:
- 3-7 nodes appropriate for the request
- Each node has 2-5 modules, each module has 2-6 features
- Types: Frontend, Backend, Database, Cache, Queue, Gateway, Microservice, Auth, External, Storage
""".formatted(description, existing);
    }

    private String buildConnectionPrompt(List<Map<String,Object>> nodes) {
        StringBuilder nodeList = new StringBuilder();
        nodes.forEach(n -> nodeList.append("- ").append(str(n,"label")).append(" (").append(str(n,"type")).append(")\n"));
        return """
You are a software architect. Define the connections between these system nodes:

%s

Generate ONLY valid JSON array (no markdown):
[
  {
    "source": "Frontend",
    "target": "Backend",
    "connectionName": "REST API",
    "protocol": "REST",
    "dataFormat": "JSON",
    "description": "HTTP REST calls for CRUD operations"
  },
  {
    "source": "Backend",
    "target": "Database",
    "connectionName": "JPA/Hibernate",
    "protocol": "JPA",
    "dataFormat": "SQL",
    "description": "ORM data persistence"
  }
]

Protocols: REST, GraphQL, WebSocket, Kafka, gRPC, RabbitMQ, JPA, Redis, JDBC
Only connect nodes that logically communicate.
""".formatted(nodeList.toString());
    }

    private String buildFilePrompt(String description, String stack, List<String> existingPaths) {
        String existing = existingPaths.isEmpty() ? "none" : String.join(", ", existingPaths.subList(0, Math.min(existingPaths.size(), 20)));
        return """
You are an expert software engineer. Generate a complete project file structure.

Project: %s
Stack: %s
Already existing files (DO NOT recreate these): %s

Return ONLY a valid JSON array (no markdown):
[
  {"path": "src", "name": "src", "parentPath": "", "folder": true, "content": null, "language": null},
  {"path": "src/main/java/com/app/controller/UserController.java", "name": "UserController.java", "parentPath": "src/main/java/com/app/controller", "folder": false, "content": "package com.app.controller;\\n\\nimport org.springframework.web.bind.annotation.*;\\n\\n@RestController\\n@RequestMapping(\\"/api/users\\")\\npublic class UserController {\\n    @GetMapping\\n    public String list() { return \\"users\\"; }\\n}", "language": "java"}
]

Include ALL required directories and files with real boilerplate code.
Minimum 15 files. Include README.md, config files, main entry points.
""".formatted(description, stack, existing);
    }

    // ── DEFAULT STRUCTURES ───────────────────────────────────────────────────

    private List<Map<String,Object>> buildDefaultStructure(Long projectId, String stack) {
        List<Map<String,Object>> files = new ArrayList<>();
        boolean spring = stack != null && stack.toLowerCase().contains("spring");
        boolean react  = stack != null && stack.toLowerCase().contains("react");
        boolean node   = stack != null && (stack.toLowerCase().contains("node") || stack.toLowerCase().contains("express"));

        if (spring) {
            af(files,"src","",true,null,null);
            af(files,"src/main","src",true,null,null);
            af(files,"src/main/java","src/main",true,null,null);
            af(files,"src/main/java/com/app","src/main/java",true,null,null);
            af(files,"src/main/java/com/app/controller","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/service","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/repository","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/entity","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/dto","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/config","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/security","src/main/java/com/app",true,null,null);
            af(files,"src/main/java/com/app/exception","src/main/java/com/app",true,null,null);
            af(files,"src/main/resources","src/main",true,null,null);
            af(files,"src/main/resources/application.properties","src/main/resources",false,
               "spring.application.name=app\nspring.datasource.url=jdbc:mysql://localhost:3306/appdb\nspring.datasource.username=root\nspring.datasource.password=\nspring.jpa.hibernate.ddl-auto=update\nserver.port=8080","properties");
            af(files,"src/main/java/com/app/Application.java","src/main/java/com/app",false,
               "package com.app;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}","java");
            af(files,"src/main/java/com/app/controller/HealthController.java","src/main/java/com/app/controller",false,
               "package com.app.controller;\n\nimport org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping(\"/api\")\npublic class HealthController {\n    @GetMapping(\"/health\")\n    public String health() { return \"OK\"; }\n}","java");
            af(files,"pom.xml","",false,
               "<?xml version=\"1.0\"?>\n<project xmlns=\"http://maven.apache.org/POM/4.0.0\">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.app</groupId>\n  <artifactId>app</artifactId>\n  <version>1.0.0</version>\n  <parent>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-parent</artifactId>\n    <version>3.5.0</version>\n  </parent>\n  <properties><java.version>21</java.version></properties>\n  <dependencies>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>\n    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>\n    <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId></dependency>\n    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><scope>provided</scope></dependency>\n  </dependencies>\n</project>","xml");
        } else if (react || node) {
            af(files,"src","",true,null,null);
            af(files,"src/components","src",true,null,null);
            af(files,"src/pages","src",true,null,null);
            af(files,"src/hooks","src",true,null,null);
            af(files,"src/api","src",true,null,null);
            af(files,"src/store","src",true,null,null);
            af(files,"src/styles","src",true,null,null);
            af(files,"src/App.jsx","src",false,
               "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Home from './pages/Home';\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}","javascript");
            af(files,"src/main.jsx","src",false,
               "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './styles/index.css';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode><App /></React.StrictMode>\n);","javascript");
            af(files,"src/pages/Home.jsx","src/pages",false,
               "export default function Home() {\n  return <main><h1>Welcome</h1></main>;\n}","javascript");
            af(files,"src/styles/index.css","src/styles",false,
               "* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: system-ui, sans-serif; }","css");
            af(files,"package.json","",false,
               "{\n  \"name\": \"app\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",\n  \"scripts\": { \"dev\": \"vite\", \"build\": \"vite build\" },\n  \"dependencies\": { \"react\": \"^19.0.0\", \"react-dom\": \"^19.0.0\", \"react-router-dom\": \"^7.0.0\" },\n  \"devDependencies\": { \"vite\": \"^6.0.0\", \"@vitejs/plugin-react\": \"^4.0.0\" }\n}","json");
            af(files,"index.html","",false,
               "<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"UTF-8\"/><title>App</title></head>\n<body><div id=\"root\"></div><script type=\"module\" src=\"/src/main.jsx\"></script></body>\n</html>","html");
            af(files,"vite.config.js","",false,
               "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });","javascript");
        }
        af(files,"README.md","",false,"# Project\n\nGenerated by **DevForge AI**.\n\n## Stack\n" + (stack != null ? stack : "Custom") + "\n\n## Getting Started\n\nSee documentation for setup instructions.","markdown");
        fileService.bulkCreate(projectId, files);
        return files;
    }

    // ── UTILITIES ────────────────────────────────────────────────────────────

    private String callAi(String prompt) {
        try {
            return openRouter.complete("openai/gpt-4.1-mini",
                    List.of(new ChatMessage("user", prompt)));
        } catch (Exception e) {
            log.error("[AiGenerator] AI call failed: {}", e.getMessage());
            return "{}";
        }
    }

    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) return "{}";
        // Remove markdown fences
        raw = raw.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();
        int a = raw.indexOf('[');
        int o = raw.indexOf('{');
        if (a >= 0 && (o < 0 || a < o)) {
            int end = raw.lastIndexOf(']');
            if (end > a) return raw.substring(a, end + 1);
        }
        if (o >= 0) {
            int end = raw.lastIndexOf('}');
            if (end > o) return raw.substring(o, end + 1);
        }
        return raw;
    }

    private String stripFences(String code) {
        if (code == null) return "";
        return code.replaceAll("(?m)^```[a-zA-Z]*\\s*$", "").replaceAll("(?m)^```\\s*$", "").trim();
    }

    private String detectStack(Map<String,Object> analysis, Map<String,Object> archResult) {
        if (analysis == null) return "Unknown";
        List<String> fw = castStrList(analysis.get("frameworks"));
        List<String> la = castStrList(analysis.get("languages"));
        if (!fw.isEmpty()) return String.join(" + ", fw);
        if (!la.isEmpty()) return String.join(" + ", la);
        // Try to detect from nodes
        if (archResult != null) {
            List<Map<String,Object>> nodes = cast(archResult.get("nodes"));
            if (nodes != null) {
                List<String> techs = nodes.stream().map(n -> str(n,"technology","")).filter(s -> !s.isBlank()).collect(Collectors.toList());
                if (!techs.isEmpty()) return String.join(" + ", techs);
            }
        }
        return "Custom";
    }

    private int countNodes(Map<String,Object> archResult) {
        if (archResult == null) return 0;
        List<?> nodes = cast(archResult.get("nodes"));
        return nodes != null ? nodes.size() : 0;
    }

    private Long findNodeId(List<Map<String,Object>> nodes, String label) {
        return nodes.stream()
                .filter(n -> str(n,"label").equalsIgnoreCase(label))
                .map(n -> n.get("id") instanceof Number ? ((Number)n.get("id")).longValue() : null)
                .filter(Objects::nonNull)
                .findFirst().orElse(null);
    }

    private void af(List<Map<String,Object>> list, String path, String parentPath,
                    boolean folder, String content, String lang) {
        String name = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
        Map<String,Object> f = new LinkedHashMap<>();
        f.put("path", path); f.put("name", name); f.put("parentPath", parentPath);
        f.put("folder", folder); f.put("content", content);
        f.put("language", lang != null ? lang : ProjectFileService.detectLanguage(name));
        list.add(f);
    }

    private String str(Map<String,Object> m, String key) { return str(m, key, ""); }
    private String str(Map<String,Object> m, String key, String def) {
        Object v = m == null ? null : m.get(key);
        return v == null || "null".equals(String.valueOf(v)) ? def : String.valueOf(v);
    }
    private String slug(String t) {
        if (t == null) return "node";
        return t.toLowerCase().replaceAll("[^a-z0-9]","-").replaceAll("-+","-").replaceAll("^-|-$","");
    }

    @SuppressWarnings("unchecked")
    private <T> List<T> cast(Object o) { return o instanceof List ? (List<T>)o : null; }

    private List<String> castStrList(Object o) {
        if (!(o instanceof List)) return new ArrayList<>();
        List<?> raw = (List<?>)o;
        return raw.stream().map(String::valueOf).filter(s -> !s.isBlank() && !"null".equals(s)).collect(Collectors.toList());
    }

    private List<Map<String,Object>> castModules(Object o) {
        if (!(o instanceof List)) return new ArrayList<>();
        List<?> raw = (List<?>)o;
        List<Map<String,Object>> result = new ArrayList<>();
        for (Object item : raw) {
            if (item instanceof Map) {
                @SuppressWarnings("unchecked") Map<String,Object> m = (Map<String,Object>)item;
                result.add(m);
            } else if (item instanceof String) {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("name", item);
                m.put("features", new ArrayList<>());
                result.add(m);
            }
        }
        return result;
    }
}
