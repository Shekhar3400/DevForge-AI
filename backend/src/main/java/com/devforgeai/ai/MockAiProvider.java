package com.devforgeai.ai;

import org.springframework.stereotype.Component;

/**
 * MockAiProvider — kept for reference and legacy compatibility.
 *
 * NOTE: ChatService no longer calls AiProvider directly.
 * All AI calls are now routed through AiGateway → specific agents → OpenRouterProvider.
 *
 * @Primary removed so MockAiProvider does not interfere with the new gateway.
 * GroqProvider can be plugged in later by implementing AiProvider and marking @Primary.
 */
@Component
public class MockAiProvider implements AiProvider {

    @Override
    public String generateResponse(String projectContext, String prompt) {
        return """
                [MockAiProvider] This is a placeholder response.
                ChatService now uses AiGateway with OpenRouter integration.
                """;
    }
}