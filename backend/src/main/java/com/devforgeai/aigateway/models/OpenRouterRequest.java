package com.devforgeai.aigateway.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * JSON body sent to https://openrouter.ai/api/v1/chat/completions
 */
@Getter
@Setter
@Builder
public class OpenRouterRequest {

    @JsonProperty("model")
    private String model;

    @JsonProperty("messages")
    private List<ChatMessage> messages;

    @JsonProperty("max_tokens")
    @Builder.Default
    private int maxTokens = 2048;

    @JsonProperty("temperature")
    @Builder.Default
    private double temperature = 0.7;

    @JsonProperty("stream")
    @Builder.Default
    private boolean stream = false;
}
