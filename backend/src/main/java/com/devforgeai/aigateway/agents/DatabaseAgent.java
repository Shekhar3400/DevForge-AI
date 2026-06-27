package com.devforgeai.aigateway.agents;
import com.devforgeai.aigateway.config.OpenRouterProperties;
import com.devforgeai.aigateway.models.IntentType;
import com.devforgeai.aigateway.prompts.PromptBuilder;
import com.devforgeai.aigateway.providers.OpenRouterProvider;
import com.devforgeai.entity.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.List;

@Slf4j @Component @RequiredArgsConstructor
public class DatabaseAgent implements AiAgent {
    private final OpenRouterProvider provider;
    private final OpenRouterProperties props;
    private final PromptBuilder promptBuilder;

    @Override public String respond(String ctx, List<Message> history, String prompt) {
        String model = props.modelFor(IntentType.DATABASE.configKey());
        log.info("[DatabaseAgent] model={}", model);
        return provider.complete(model, promptBuilder.build(IntentType.DATABASE, ctx, history, prompt));
    }
}
