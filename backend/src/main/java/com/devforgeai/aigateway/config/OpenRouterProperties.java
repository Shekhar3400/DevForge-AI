package com.devforgeai.aigateway.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Binds all openrouter.* properties from application.yml.
 * API keys live here only — never hardcoded anywhere else.
 */
@Component
@ConfigurationProperties(prefix = "openrouter")
@Getter
@Setter
public class OpenRouterProperties {

    /** OpenRouter completions endpoint */
    private String baseUrl = "https://openrouter.ai/api/v1/chat/completions";

    /** HTTP read/connect timeout in seconds */
    private int timeoutSeconds = 60;

    /** Max retry attempts when a key/model fails */
    private int maxRetries = 3;

    /** How many past messages to inject into the prompt */
    private int memorySize = 20;

    /** Round-robin API key pool — add as many keys as needed */
    private List<String> keys = new ArrayList<>();

    /**
     * Model routing map.
     * Keys must match IntentType.name().toLowerCase():
     *   architecture, backend, frontend, debug,
     *   documentation, database, security, planning, general
     */
    private Map<String, String> models = new HashMap<>();

    /** Returns the model for the given intent, falling back to gpt-4.1 */
    public String modelFor(String intentKey) {
        return models.getOrDefault(intentKey, "openai/gpt-4.1");
    }
}
