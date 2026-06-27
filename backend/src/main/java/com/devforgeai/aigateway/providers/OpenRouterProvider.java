package com.devforgeai.aigateway.providers;

import com.devforgeai.aigateway.config.OpenRouterProperties;
import com.devforgeai.aigateway.models.ChatMessage;
import com.devforgeai.aigateway.models.OpenRouterRequest;
import com.devforgeai.aigateway.models.OpenRouterResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Slf4j
@Component
public class OpenRouterProvider {

    private final HttpClient           httpClient;
    private final OpenRouterProperties props;
    private final ApiKeyManager        keyManager;
    private final ObjectMapper         objectMapper;

    public OpenRouterProvider(HttpClient httpClient, OpenRouterProperties props,
                               ApiKeyManager keyManager, ObjectMapper objectMapper) {
        this.httpClient   = httpClient;
        this.props        = props;
        this.keyManager   = keyManager;
        this.objectMapper = objectMapper;
    }

    public String complete(String model, List<ChatMessage> messages) {
        int maxRetries = Math.max(1, Math.min(props.getMaxRetries(), keyManager.keyCount()));

        for (int attempt = 0; attempt < maxRetries; attempt++) {
            String apiKey;
            try {
                apiKey = attempt == 0 ? keyManager.getNextKey() : keyManager.getKeyAt(attempt);
            } catch (IllegalStateException e) {
                log.error("[OpenRouterProvider] {}", e.getMessage());
                return fallback("No API keys configured.");
            }

            long start = System.currentTimeMillis();
            try {
                String json = objectMapper.writeValueAsString(
                        OpenRouterRequest.builder().model(model).messages(messages).build());

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(props.getBaseUrl()))
                        .timeout(Duration.ofSeconds(props.getTimeoutSeconds()))
                        .header("Content-Type",  "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer",  "https://devforgeai.app")
                        .header("X-Title",       "DevForge AI")
                        .POST(HttpRequest.BodyPublishers.ofString(json))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                long elapsed = System.currentTimeMillis() - start;
                log.info("[OpenRouterProvider] model={} attempt={} status={} time={}ms",
                        model, attempt, response.statusCode(), elapsed);

                if (response.statusCode() == 200) {
                    OpenRouterResponse parsed = objectMapper.readValue(response.body(), OpenRouterResponse.class);
                    String content = parsed.firstContent();
                    if (content != null && !content.isBlank()) return content.trim();
                    return fallback("AI returned an empty response.");
                }
                log.warn("[OpenRouterProvider] HTTP {} attempt {} — {}", response.statusCode(), attempt,
                        response.body().length() > 200 ? response.body().substring(0, 200) : response.body());

            } catch (Exception e) {
                log.error("[OpenRouterProvider] attempt={} error={}", attempt, e.getMessage());
            }
        }
        log.error("[OpenRouterProvider] All {} attempts exhausted.", maxRetries);
        return fallback("AI service temporarily unavailable.");
    }

    private String fallback(String reason) {
        return "⚠️ **DevForge AI** — " + reason + "\n\nCheck your OpenRouter API keys in application.yml.";
    }
}
