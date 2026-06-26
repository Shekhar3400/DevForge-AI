package com.devforgeai.ai;

import org.springframework.stereotype.Component;

@Component
public class GroqProvider implements AiProvider {

    @Override
    public String generateResponse(
            String projectContext,
            String prompt
    ) {
        return "Groq Integration Coming Soon";
    }
}