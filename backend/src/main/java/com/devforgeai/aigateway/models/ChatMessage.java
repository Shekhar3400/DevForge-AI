package com.devforgeai.aigateway.models;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * A single message in an OpenRouter chat completion request.
 * role: "system" | "user" | "assistant"
 */
public class ChatMessage {

    @JsonProperty("role")
    private String role;

    @JsonProperty("content")
    private String content;

    public ChatMessage() {}

    public ChatMessage(String role, String content) {
        this.role    = role;
        this.content = content;
    }

    public String getRole()    { return role; }
    public String getContent() { return content; }
    public void setRole(String role)       { this.role = role; }
    public void setContent(String content) { this.content = content; }

    public static ChatMessage system(String content)    { return new ChatMessage("system",    content); }
    public static ChatMessage user(String content)      { return new ChatMessage("user",      content); }
    public static ChatMessage assistant(String content) { return new ChatMessage("assistant", content); }
}
