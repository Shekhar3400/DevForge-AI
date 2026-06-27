package com.devforgeai.aigateway;

import com.devforgeai.aigateway.agents.*;
import com.devforgeai.aigateway.memory.ConversationMemory;
import com.devforgeai.aigateway.models.IntentType;
import com.devforgeai.aigateway.providers.IntentClassifier;
import com.devforgeai.entity.Message;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AiGateway {

    private static final Logger log = LoggerFactory.getLogger(AiGateway.class);

    private final ConversationMemory    memory;
    private final IntentClassifier      classifier;

    // All 9 agents
    private final ArchitectureAgent     architectureAgent;
    private final BackendCodeAgent      backendCodeAgent;
    private final FrontendCodeAgent     frontendCodeAgent;
    private final DebugAgent            debugAgent;
    private final DocumentationAgent    documentationAgent;
    private final DatabaseAgent         databaseAgent;
    private final SecurityAgent         securityAgent;
    private final PlanningAgent         planningAgent;
    private final GeneralChatAgent      generalChatAgent;

    /**
     * Process a user message and return the AI response.
     *
     * @param chatSessionId  database ID of the current chat session
     * @param projectContext JSON string from ProjectContextService
     * @param userPrompt     the user's message text
     */
    public String process(Long chatSessionId, String projectContext, String userPrompt) {

        long start = System.currentTimeMillis();

        // 1 ── Load chat history
        List<Message> history = memory.loadHistory(chatSessionId);

        // 2 ── Classify intent
        IntentType intent = classifier.classify(userPrompt);

        log.info(
            "[AiGateway] chatId={} intent={} historySize={}",
            chatSessionId, intent, history.size()
        );

        // 3 ── Route to agent
        AiAgent agent = selectAgent(intent);

        // 4 ── Generate response
        try {
            String response = agent.respond(projectContext, history, userPrompt);

            long elapsed = System.currentTimeMillis() - start;
            log.info(
                "[AiGateway] chatId={} intent={} agent={} time={}ms",
                chatSessionId, intent, agent.getClass().getSimpleName(), elapsed
            );

            return response;

        } catch (Exception e) {
            log.error(
                "[AiGateway] chatId={} intent={} FAILED: {}",
                chatSessionId, intent, e.getMessage()
            );
            return "⚠️ **DevForge AI** is temporarily unavailable.\n\n" +
                   "Please try again in a moment. If the problem persists, " +
                   "check that your OpenRouter API keys are valid.";
        }
    }

    // ── Agent routing ────────────────────────────────────────────────────────

    private AiAgent selectAgent(IntentType intent) {
        return switch (intent) {
            case ARCHITECTURE  -> architectureAgent;
            case BACKEND       -> backendCodeAgent;
            case FRONTEND      -> frontendCodeAgent;
            case DEBUG         -> debugAgent;
            case DOCUMENTATION -> documentationAgent;
            case DATABASE      -> databaseAgent;
            case SECURITY      -> securityAgent;
            case PLANNING      -> planningAgent;
            default            -> generalChatAgent;
        };
    }
}
