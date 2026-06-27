package com.devforgeai.controller;

import com.devforgeai.entity.ProjectFile;
import com.devforgeai.service.ProjectFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/files")
@RequiredArgsConstructor
public class ProjectFileController {

    private final ProjectFileService fileService;

    /** All files flat (for building tree in frontend) */
    @GetMapping
    public List<ProjectFile> getAll(@PathVariable Long projectId) {
        return fileService.getFiles(projectId);
    }

    /** Children of a path (for lazy loading) */
    @GetMapping("/children")
    public List<ProjectFile> getChildren(@PathVariable Long projectId,
                                          @RequestParam(defaultValue = "") String parent) {
        return fileService.getChildren(projectId, parent);
    }

    /** Create single file or folder */
    @PostMapping
    public ProjectFile create(@PathVariable Long projectId,
                               @RequestBody Map<String, Object> body) {
        String  path       = String.valueOf(body.get("path"));
        String  name       = String.valueOf(body.getOrDefault("name", lastSegment(path)));
        String  parentPath = String.valueOf(body.getOrDefault("parentPath", parentOf(path)));
        boolean isFolder   = Boolean.parseBoolean(String.valueOf(body.getOrDefault("folder", false)));
        String  content    = isFolder ? null : String.valueOf(body.getOrDefault("content", ""));
        String  language   = String.valueOf(body.getOrDefault("language",
                ProjectFileService.detectLanguage(name)));
        return fileService.createFile(projectId, path, name, parentPath, isFolder, content, language);
    }

    /** Update file content */
    @PatchMapping("/{fileId}/content")
    public ProjectFile updateContent(@PathVariable Long projectId,
                                      @PathVariable Long fileId,
                                      @RequestBody Map<String, String> body) {
        return fileService.updateContent(fileId, body.get("content"));
    }

    /** Rename */
    @PatchMapping("/{fileId}/rename")
    public ProjectFile rename(@PathVariable Long projectId,
                               @PathVariable Long fileId,
                               @RequestBody Map<String, String> body) {
        return fileService.rename(fileId, body.get("name"));
    }

    /** Delete */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId,
                                        @PathVariable Long fileId) {
        fileService.delete(fileId);
        return ResponseEntity.noContent().build();
    }

    /** Bulk create (AI generator) */
    @PostMapping("/bulk")
    public List<ProjectFile> bulkCreate(@PathVariable Long projectId,
                                         @RequestBody List<Map<String, Object>> files) {
        return fileService.bulkCreate(projectId, files);
    }

    // ── helpers ──
    private String lastSegment(String path) {
        int i = path.lastIndexOf('/');
        return i < 0 ? path : path.substring(i + 1);
    }

    private String parentOf(String path) {
        int i = path.lastIndexOf('/');
        return i < 0 ? "" : path.substring(0, i);
    }
}
