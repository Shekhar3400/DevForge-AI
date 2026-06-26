package com.devforgeai.ai;

public interface AiProvider {

    String generateResponse(
            String projectContext,
            String prompt
    );
}