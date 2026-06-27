package com.devforgeai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.concurrent.*;
import java.util.*;

/**
 * Executes code snippets in a sandboxed temp directory.
 * Supports: Java, JavaScript (Node), Python, C, C++, Go, PHP, Ruby.
 * Requires the corresponding runtimes to be installed on the host machine.
 */
@Slf4j
@Service
public class CodeExecutionService {

    private static final int TIMEOUT_SECONDS = 15;

    public record ExecutionResult(
            String output,
            String error,
            int exitCode,
            long executionTimeMs,
            String language
    ) {}

    public ExecutionResult execute(String language, String code) {
        long start = System.currentTimeMillis();
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("devforge_exec_");
            ExecutionResult result = switch (language.toLowerCase()) {
                case "javascript", "js"         -> runNode(tempDir, code);
                case "typescript", "ts"         -> runTypeScript(tempDir, code);
                case "python", "py"             -> runPython(tempDir, code);
                case "java"                     -> runJava(tempDir, code);
                case "c"                        -> runC(tempDir, code);
                case "cpp", "c++"              -> runCpp(tempDir, code);
                case "go"                       -> runGo(tempDir, code);
                case "php"                      -> runPhp(tempDir, code);
                case "ruby", "rb"              -> runRuby(tempDir, code);
                case "rust", "rs"              -> runRust(tempDir, code);
                case "kotlin", "kt"            -> runKotlin(tempDir, code);
                case "csharp", "cs", "c#"     -> runCSharp(tempDir, code);
                case "sql"                      -> runSql(code);
                case "html"                     -> new ExecutionResult(code, "", 0, 0, "html");
                default                         -> new ExecutionResult("",
                        "Language '" + language + "' execution not supported on this server.",
                        1, 0, language);
            };
            long elapsed = System.currentTimeMillis() - start;
            return new ExecutionResult(result.output(), result.error(),
                    result.exitCode(), elapsed, language);
        } catch (Exception e) {
            log.error("[CodeExecution] Error executing {} code: {}", language, e.getMessage());
            return new ExecutionResult("", "Execution error: " + e.getMessage(),
                    1, System.currentTimeMillis() - start, language);
        } finally {
            deleteTempDir(tempDir);
        }
    }

    // ── Runners ──────────────────────────────────────────────────────────────

    private ExecutionResult runNode(Path dir, String code) throws Exception {
        Path file = dir.resolve("index.js");
        Files.writeString(file, code);
        return run(dir, List.of("node", file.toString()));
    }

    private ExecutionResult runPython(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.py");
        Files.writeString(file, code);
        // Try python3 first, fall back to python
        try { return run(dir, List.of("python3", file.toString())); }
        catch (Exception e) { return run(dir, List.of("python", file.toString())); }
    }

    private ExecutionResult runJava(Path dir, String code) throws Exception {
        // Extract class name
        String className = "Main";
        var matcher = java.util.regex.Pattern
                .compile("public\\s+class\\s+(\\w+)").matcher(code);
        if (matcher.find()) className = matcher.group(1);

        Path file = dir.resolve(className + ".java");
        Files.writeString(file, code);

        // Compile
        ExecutionResult compile = run(dir, List.of("javac", file.toString()));
        if (compile.exitCode() != 0) return compile;

        // Run
        return run(dir, List.of("java", "-cp", dir.toString(), className));
    }

    private ExecutionResult runC(Path dir, String code) throws Exception {
        Path src = dir.resolve("main.c");
        Path out = dir.resolve("main_out");
        Files.writeString(src, code);
        ExecutionResult compile = run(dir, List.of("gcc", src.toString(), "-o", out.toString()));
        if (compile.exitCode() != 0) return compile;
        return run(dir, List.of(out.toString()));
    }

    private ExecutionResult runCpp(Path dir, String code) throws Exception {
        Path src = dir.resolve("main.cpp");
        Path out = dir.resolve("main_out");
        Files.writeString(src, code);
        ExecutionResult compile = run(dir, List.of("g++", src.toString(), "-o", out.toString()));
        if (compile.exitCode() != 0) return compile;
        return run(dir, List.of(out.toString()));
    }

    private ExecutionResult runGo(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.go");
        Files.writeString(file, code);
        return run(dir, List.of("go", "run", file.toString()));
    }

    private ExecutionResult runPhp(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.php");
        Files.writeString(file, code);
        return run(dir, List.of("php", file.toString()));
    }

    private ExecutionResult runRuby(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.rb");
        Files.writeString(file, code);
        return run(dir, List.of("ruby", file.toString()));
    }

    private ExecutionResult runTypeScript(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.ts");
        Files.writeString(file, code);
        // Try ts-node first, fall back to npx ts-node
        try { return run(dir, List.of("ts-node", file.toString())); }
        catch (Exception e) {
            try { return run(dir, List.of("npx", "--yes", "ts-node", file.toString())); }
            catch (Exception e2) { return new ExecutionResult("",
                    "TypeScript runner not found. Install ts-node: npm i -g ts-node", 1, 0, "typescript"); }
        }
    }

    private ExecutionResult runRust(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.rs");
        Path out  = dir.resolve("main_out");
        Files.writeString(file, code);
        ExecutionResult compile = run(dir, List.of("rustc", file.toString(), "-o", out.toString()));
        if (compile.exitCode() != 0) return compile;
        return run(dir, List.of(out.toString()));
    }

    private ExecutionResult runKotlin(Path dir, String code) throws Exception {
        Path file = dir.resolve("main.kt");
        Path jar  = dir.resolve("main.jar");
        Files.writeString(file, code);
        ExecutionResult compile = run(dir, List.of("kotlinc", file.toString(), "-include-runtime", "-d", jar.toString()));
        if (compile.exitCode() != 0) return compile;
        return run(dir, List.of("java", "-jar", jar.toString()));
    }

    private ExecutionResult runCSharp(Path dir, String code) throws Exception {
        Path file = dir.resolve("Program.cs");
        Files.writeString(file, code);
        // Try dotnet-script
        try { return run(dir, List.of("dotnet-script", file.toString())); }
        catch (Exception e) {
            // Try csc (Mono)
            Path out = dir.resolve("Program.exe");
            ExecutionResult compile = run(dir, List.of("csc", "-out:" + out.toString(), file.toString()));
            if (compile.exitCode() != 0) return compile;
            return run(dir, List.of("mono", out.toString()));
        }
    }

    private ExecutionResult runSql(String code) {
        return new ExecutionResult(
                "-- SQL execution requires a live database connection.\n" +
                "-- Connect your MySQL instance to run SQL directly.",
                "", 0, 0, "sql");
    }

    // ── Process runner ────────────────────────────────────────────────────────

    private ExecutionResult run(Path workDir, List<String> command) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command)
                .directory(workDir.toFile())
                .redirectErrorStream(false);
        pb.environment().put("HOME", workDir.toString());

        Process process = pb.start();

        // Read stdout + stderr concurrently to avoid blocking
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();

        Future<Void> outFuture = readStream(process.getInputStream(), stdout);
        Future<Void> errFuture = readStream(process.getErrorStream(), stderr);

        boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        outFuture.get(2, TimeUnit.SECONDS);
        errFuture.get(2, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            return new ExecutionResult("", "Execution timed out after " + TIMEOUT_SECONDS + " seconds.", 124, 0, "");
        }

        return new ExecutionResult(
                stdout.toString().trim(),
                stderr.toString().trim(),
                process.exitValue(),
                0, "");
    }

    private Future<Void> readStream(InputStream is, StringBuilder sb) {
        return CompletableFuture.supplyAsync(() -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line).append("\n");
            } catch (IOException ignored) {}
            return null;
        });
    }

    private void deleteTempDir(Path dir) {
        if (dir == null) return;
        try {
            Files.walk(dir).sorted(Comparator.reverseOrder())
                    .map(Path::toFile).forEach(File::delete);
        } catch (Exception ignored) {}
    }
}
