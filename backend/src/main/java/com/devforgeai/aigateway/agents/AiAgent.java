package com.devforgeai.aigateway.agents;

import com.devforgeai.entity.Message;

import java.util.List;

/**
 * Common interface for every specialised AI agent.
 * Each agent knows its own model and intent role.
 */
public interface AiAgent {

    /**
     * Generate a response for the user's prompt.
     *
     * @param projectContext JSON context from ProjectContextService
     * @param history        recent messages (from ConversationMemory)
     * @param userPrompt     the current user input
     * @return AI-generated response text (may contain Markdown)
     */
    String respond(String projectContext, List<Message> history, String userPrompt);
}
