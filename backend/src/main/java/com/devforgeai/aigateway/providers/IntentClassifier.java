package com.devforgeai.aigateway.providers;

import com.devforgeai.aigateway.models.IntentType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Classifies a user prompt into an IntentType so the gateway
 * can route to the right agent and model.
 *
 * Uses keyword scoring — no external calls, instant, zero cost.
 */
@Component
public class IntentClassifier {

    // Each entry maps an IntentType to the keywords that signal it.
    private static final Map<IntentType, List<String>> KEYWORD_MAP = Map.of(

        IntentType.ARCHITECTURE, List.of(
            "architecture", "diagram", "microservice", "system design",
            "component", "service mesh", "infrastructure", "topology",
            "monolith", "distributed", "event-driven", "design pattern",
            "aws", "gcp", "azure", "kubernetes", "docker", "deploy"
        ),

        IntentType.BACKEND, List.of(
            "backend", "spring", "java", "api", "rest", "endpoint",
            "controller", "service", "repository", "jpa", "hibernate",
            "server", "request", "response", "dto", "entity", "maven",
            "gradle", "spring boot", "tomcat", "microservice"
        ),

        IntentType.FRONTEND, List.of(
            "frontend", "react", "vue", "angular", "html", "css",
            "component", "ui", "ux", "tailwind", "javascript", "typescript",
            "vite", "webpack", "hook", "state", "zustand", "redux",
            "axios", "fetch", "browser", "dom", "responsive"
        ),

        IntentType.DEBUG, List.of(
            "error", "bug", "fix", "broken", "exception", "stacktrace",
            "null pointer", "404", "500", "crash", "fail", "issue",
            "not working", "debug", "log", "trace", "problem", "why",
            "unexpected", "wrong result", "cannot", "can't", "doesn't work"
        ),

        IntentType.DOCUMENTATION, List.of(
            "document", "readme", "wiki", "explain", "swagger", "openapi",
            "javadoc", "comment", "describe", "what is", "how does",
            "guide", "tutorial", "spec", "specification", "summary"
        ),

        IntentType.DATABASE, List.of(
            "database", "sql", "mysql", "postgres", "mongodb", "redis",
            "schema", "table", "query", "index", "join", "migration",
            "entity", "relation", "nosql", "transaction", "hibernate",
            "jpa", "data model", "column", "row", "crud"
        ),

        IntentType.SECURITY, List.of(
            "security", "auth", "jwt", "oauth", "token", "encrypt",
            "password", "hash", "role", "permission", "cors", "csrf",
            "xss", "injection", "vulnerability", "secure", "ssl", "tls",
            "bcrypt", "spring security", "access control", "authorization"
        ),

        IntentType.PLANNING, List.of(
            "plan", "roadmap", "sprint", "milestone", "feature", "backlog",
            "priorit", "estimate", "timeline", "release", "scope",
            "requirement", "strategy", "objective", "okr", "task", "story"
        )
    );

    /**
     * Scores each intent by counting keyword hits and returns the winner.
     * Falls back to GENERAL when no intent reaches a minimum score.
     */
    public IntentType classify(String prompt) {

        if (prompt == null || prompt.isBlank()) {
            return IntentType.GENERAL;
        }

        String lower = prompt.toLowerCase();
        IntentType best  = IntentType.GENERAL;
        int        score = 0;

        for (Map.Entry<IntentType, List<String>> entry : KEYWORD_MAP.entrySet()) {
            int hits = 0;
            for (String kw : entry.getValue()) {
                if (lower.contains(kw)) hits++;
            }
            if (hits > score) {
                score = hits;
                best  = entry.getKey();
            }
        }

        return best;
    }
}
