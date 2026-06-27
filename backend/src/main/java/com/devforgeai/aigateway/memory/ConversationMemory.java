package com.devforgeai.aigateway.memory;

import com.devforgeai.aigateway.config.OpenRouterProperties;
import com.devforgeai.entity.Message;
import com.devforgeai.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ConversationMemory {

    private static final Logger log = LoggerFactory.getLogger(ConversationMemory.class);

    private final MessageRepository    messageRepository;
    private final OpenRouterProperties props;

    public List<Message> loadHistory(Long chatSessionId) {
        int limit = props.getMemorySize();
        List<Message> all = messageRepository.findByChatSessionId(chatSessionId);
        if (all == null || all.isEmpty()) return Collections.emptyList();
        int fromIndex = Math.max(0, all.size() - limit);
        List<Message> window = all.subList(fromIndex, all.size());
        log.debug("[ConversationMemory] chatId={} total={} injecting={}", chatSessionId, all.size(), window.size());
        return window;
    }
}
