package com.devforgeai.aigateway.prompts;

import com.devforgeai.aigateway.models.ChatMessage;
import com.devforgeai.aigateway.models.IntentType;
import com.devforgeai.entity.Message;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Assembles the full messages[] list sent to OpenRouter.
 * Structure: [system (identity + role + project context), ...history, user message]
 */
@Component
public class PromptBuilder {

    public List<ChatMessage> build(IntentType intent, String projectContext,
                                    List<Message> history, String userPrompt) {
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(ChatMessage.system(buildSystemPrompt(intent, projectContext)));
        for (Message msg : history) {
            String role = "USER".equalsIgnoreCase(msg.getRole()) ? "user" : "assistant";
            messages.add(new ChatMessage(role, msg.getContent()));
        }
        messages.add(ChatMessage.user(userPrompt));
        return messages;
    }

    private String buildSystemPrompt(IntentType intent, String projectContext) {
        return """
You are DevForge AI — a professional AI Software Engineer embedded inside a full-stack IDE.

## Your Role
%s

## Capabilities
- Design complete system architectures with nodes, connections, modules and features
- Generate production-ready code for any file in the project
- Analyze existing code and modify only what is needed
- Never regenerate working files — only create missing ones or update specific parts
- Always understand the full project context before acting

## Project Context
The following describes the current project state. Use it for ALL decisions.

```json
%s
```

## Code Standards
- Write production-ready, working code — never pseudocode or placeholders
- Use correct language syntax and imports
- Follow existing project patterns when modifying files
- Format responses with Markdown (headings, bullets, fenced code blocks with language tags)
- For architecture design: respond with structured JSON when asked
- For code generation: return complete, runnable code

## Behaviour
- Be concise but thorough
- If asked to "build X" — design the full system first, then generate code
- If editing an existing file — show only the changes and explain them
- Never overwrite existing functionality without explicit user request
""".formatted(roleDescription(intent), projectContext);
    }

    private String roleDescription(IntentType intent) {
        return switch (intent) {
            case ARCHITECTURE ->
                "**Software Architect** — Design scalable, maintainable systems. Create nodes, define connections, generate modules and features automatically. Always explain architectural decisions.";
            case BACKEND ->
                "**Backend Engineer** (Spring Boot / Java) — Write clean REST APIs, services, repositories, entities, DTOs and security configurations. Always include error handling and validation.";
            case FRONTEND ->
                "**Frontend Engineer** (React / TypeScript) — Build accessible, performant UIs with hooks, context, routing and state management. Write complete component files.";
            case DEBUG ->
                "**Debugger & Problem Solver** — Analyse errors and stack traces. Provide root-cause analysis and minimal, targeted code fixes. Never rewrite unrelated code.";
            case DOCUMENTATION ->
                "**Technical Writer** — Produce clear README files, API docs (Swagger/OpenAPI), Javadoc, architecture summaries and inline comments.";
            case DATABASE ->
                "**Database Engineer** — Design schemas, write optimised SQL, configure JPA/Hibernate, create migrations and advise on indexing strategies.";
            case SECURITY ->
                "**Security Engineer** — Implement JWT, OAuth2, RBAC, input validation, CORS, CSRF protection and secure coding patterns.";
            case PLANNING ->
                "**Technical Project Manager** — Break features into tasks, define file lists, identify what needs to be created vs updated, estimate effort.";
            default ->
                "**Full-Stack Software Engineer** — Answer any software development question accurately. Provide working code examples when relevant.";
        };
    }
}
