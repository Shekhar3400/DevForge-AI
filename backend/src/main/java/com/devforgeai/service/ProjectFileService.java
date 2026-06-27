package com.devforgeai.service;

import com.devforgeai.entity.Project;
import com.devforgeai.entity.ProjectFile;
import com.devforgeai.repository.ProjectFileRepository;
import com.devforgeai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectFileService {

    private final ProjectFileRepository fileRepository;
    private final ProjectRepository     projectRepository;

    /** All files/folders for a project (flat list) */
    public List<ProjectFile> getFiles(Long projectId) {
        return fileRepository.findByProjectIdOrderByPathAsc(projectId);
    }

    /** Children of a directory */
    public List<ProjectFile> getChildren(Long projectId, String parentPath) {
        return fileRepository.findByProjectIdAndParentPathOrderByFolderDescNameAsc(projectId, parentPath == null ? "" : parentPath);
    }

    /** Create a single file or folder */
    @Transactional
    public ProjectFile createFile(Long projectId, String path, String name,
                                  String parentPath, boolean isFolder,
                                  String content, String language) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Ensure parent folders exist
        if (!parentPath.isEmpty()) {
            ensureFolders(project, parentPath);
        }

        // Avoid duplicate
        return fileRepository.findByProjectIdAndPath(projectId, path)
                .orElseGet(() -> fileRepository.save(ProjectFile.builder()
                        .project(project)
                        .path(path)
                        .name(name)
                        .parentPath(parentPath == null ? "" : parentPath)
                        .folder(isFolder)
                        .content(isFolder ? null : (content != null ? content : ""))
                        .language(language)
                        .build()));
    }

    /** Update file content */
    @Transactional
    public ProjectFile updateContent(Long fileId, String content) {
        ProjectFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        file.setContent(content);
        return fileRepository.save(file);
    }

    /** Rename file / folder */
    @Transactional
    public ProjectFile rename(Long fileId, String newName) {
        ProjectFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        String oldPath = file.getPath();
        String newPath = file.getParentPath().isEmpty()
                ? newName
                : file.getParentPath() + "/" + newName;
        file.setName(newName);
        file.setPath(newPath);

        // If it's a folder, rename all children recursively
        if (file.isFolder()) {
            List<ProjectFile> children = fileRepository
                    .findByProjectIdAndPathStartingWith(file.getProject().getId(), oldPath + "/");
            for (ProjectFile child : children) {
                child.setPath(newPath + child.getPath().substring(oldPath.length()));
                child.setParentPath(newPath + child.getParentPath().substring(oldPath.length()));
                fileRepository.save(child);
            }
        }

        return fileRepository.save(file);
    }

    /** Delete file or folder (cascades to children) */
    @Transactional
    public void delete(Long fileId) {
        ProjectFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        if (file.isFolder()) {
            List<ProjectFile> children = fileRepository
                    .findByProjectIdAndPathStartingWith(file.getProject().getId(), file.getPath() + "/");
            fileRepository.deleteAll(children);
        }
        fileRepository.delete(file);
    }

    /** Bulk create files (used by AI generator) */
    @Transactional
    public List<ProjectFile> bulkCreate(Long projectId, List<Map<String, Object>> files) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // Sort by path length so parent folders are created first
        files.sort((a, b) -> String.valueOf(a.get("path")).compareTo(String.valueOf(b.get("path"))));

        return files.stream().map(f -> {
            String path       = String.valueOf(f.get("path"));
            String name       = String.valueOf(f.getOrDefault("name", lastSegment(path)));
            String parentPath = String.valueOf(f.getOrDefault("parentPath", parentOf(path)));
            boolean isFolder  = Boolean.parseBoolean(String.valueOf(f.getOrDefault("folder", false)));
            String content    = isFolder ? null : String.valueOf(f.getOrDefault("content", ""));
            String language   = String.valueOf(f.getOrDefault("language", detectLanguage(name)));

            return fileRepository.findByProjectIdAndPath(projectId, path)
                    .map(existing -> {
                        if (!isFolder && content != null && !content.equals("null")) {
                            existing.setContent(content);
                            return fileRepository.save(existing);
                        }
                        return existing;
                    })
                    .orElseGet(() -> fileRepository.save(ProjectFile.builder()
                            .project(project)
                            .path(path)
                            .name(name)
                            .parentPath(parentPath)
                            .folder(isFolder)
                            .content(isFolder ? null : content)
                            .language(language)
                            .build()));
        }).toList();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void ensureFolders(Project project, String folderPath) {
        String[] parts = folderPath.split("/");
        StringBuilder current = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) current.append("/");
            current.append(parts[i]);
            final String path   = current.toString();
            final String part   = parts[i];
            final String parent = i == 0 ? "" : path.substring(0, path.lastIndexOf("/"));
            fileRepository.findByProjectIdAndPath(project.getId(), path)
                    .orElseGet(() -> fileRepository.save(ProjectFile.builder()
                            .project(project)
                            .path(path)
                            .name(part)
                            .parentPath(parent)
                            .folder(true)
                            .content(null)
                            .language(null)
                            .build()));
        }
    }

    private String lastSegment(String path) {
        int idx = path.lastIndexOf('/');
        return idx < 0 ? path : path.substring(idx + 1);
    }

    private String parentOf(String path) {
        int idx = path.lastIndexOf('/');
        return idx < 0 ? "" : path.substring(0, idx);
    }

    public static String detectLanguage(String fileName) {
        if (fileName == null) return "plaintext";
        int dot = fileName.lastIndexOf('.');
        if (dot < 0) return "plaintext";
        return switch (fileName.substring(dot + 1).toLowerCase()) {
            case "java"                     -> "java";
            case "js", "mjs", "cjs"        -> "javascript";
            case "ts", "tsx"               -> "typescript";
            case "jsx"                      -> "javascript";
            case "py"                       -> "python";
            case "html", "htm"             -> "html";
            case "css"                      -> "css";
            case "json"                     -> "json";
            case "xml"                      -> "xml";
            case "yaml", "yml"             -> "yaml";
            case "sql"                      -> "sql";
            case "md", "markdown"          -> "markdown";
            case "sh", "bash"              -> "shell";
            case "go"                       -> "go";
            case "rs"                       -> "rust";
            case "kt", "kts"              -> "kotlin";
            case "cs"                       -> "csharp";
            case "php"                      -> "php";
            case "rb"                       -> "ruby";
            case "c"                        -> "c";
            case "cpp", "cc", "cxx"       -> "cpp";
            case "h", "hpp"               -> "cpp";
            case "properties", "env"       -> "properties";
            case "dockerfile"              -> "dockerfile";
            default                         -> "plaintext";
        };
    }
}
