package com.devforgeai.aigateway.providers;

import com.devforgeai.aigateway.config.OpenRouterProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
public class ApiKeyManager {

    private final List<String>  keys;
    private final AtomicInteger counter = new AtomicInteger(0);

    public ApiKeyManager(OpenRouterProperties props) {
        this.keys = props.getKeys();
        if (keys == null || keys.isEmpty()) {
            log.warn("[ApiKeyManager] No OpenRouter API keys configured.");
        } else {
            log.info("[ApiKeyManager] Initialized with {} API key(s)", keys.size());
        }
    }

    public String getNextKey() {
        if (keys == null || keys.isEmpty())
            throw new IllegalStateException("No OpenRouter API keys configured.");
        int index = Math.abs(counter.getAndIncrement() % keys.size());
        return keys.get(index);
    }

    public String getKeyAt(int index) {
        if (keys == null || keys.isEmpty())
            throw new IllegalStateException("No OpenRouter API keys configured.");
        return keys.get(Math.abs(index % keys.size()));
    }

    public int keyCount() { return keys == null ? 0 : keys.size(); }
}
