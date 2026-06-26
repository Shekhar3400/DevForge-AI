package com.devforgeai.ai;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class MockAiProvider implements AiProvider {

    @Override
    public String generateResponse(
            String projectContext,
            String prompt
    ) {

        return """
                =====================================
                DEVFORGE AI MOCK ASSISTANT
                =====================================

                Project Context:
                %s

                -------------------------------------

                User Prompt:
                %s

                -------------------------------------

                Suggested Solution:

                • Use Spring Security
                • Configure JWT Authentication
                • Create JwtAuthenticationFilter
                • Configure SecurityFilterChain
                • Protect APIs using Bearer Token
                • Store JWT in frontend localStorage

                =====================================
                """
                .formatted(projectContext, prompt);
    }
}