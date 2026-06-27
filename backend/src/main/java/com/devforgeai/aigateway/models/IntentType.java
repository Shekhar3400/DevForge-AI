package com.devforgeai.aigateway.models;

/**
 * The detected intent of a user message.
 * The name().toLowerCase() value must match a key in openrouter.models in application.yml.
 */
public enum IntentType {
    ARCHITECTURE,
    BACKEND,
    FRONTEND,
    DEBUG,
    DOCUMENTATION,
    DATABASE,
    SECURITY,
    PLANNING,
    GENERAL;

    /** Returns the yml key used to look up this intent's model. */
    public String configKey() {
        return this.name().toLowerCase();
    }
}
