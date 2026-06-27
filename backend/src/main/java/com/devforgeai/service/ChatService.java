package com.devforgeai.service;

import com.devforgeai.aigateway.AiGateway;
import com.devforgeai.dto.CreateChatRequest;
import com.devforgeai.dto.SendMessageRequest;
import com.devforgeai.entity.ChatSession;
import com.devforgeai.entity.Message;
import com.devforgeai.entity.Project;
import com.devforgeai.exception.ForbiddenException;
import com.devforgeai.exception.ResourceNotFoundException;
import com.devforgeai.repository.ChatSessionRepository;
import com.devforgeai.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository     messageRepository;
    private final ProjectService        projectService;
    private final ProjectContextService projectContextService;
    private final AiGateway             aiGateway;

    public ChatSession createChat(CreateChatRequest request) {
        Project project = projectService.findOwnedProject(request.getProjectId());
        return chatSessionRepository.save(ChatSession.builder()
                .title(request.getTitle()).project(project).build());
    }

    public Message sendMessage(Long chatId, SendMessageRequest request) {
        ChatSession session = findOwnedChat(chatId);

        Message userMessage = Message.builder()
                .chatSession(session).role("USER").content(request.getContent()).build();
        messageRepository.save(userMessage);

        String projectContext = projectContextService.getProjectContext(session.getProject().getId());
        String aiResponse     = aiGateway.process(chatId, projectContext, request.getContent());

        Message assistantMessage = Message.builder()
                .chatSession(session).role("ASSISTANT").content(aiResponse).build();
        messageRepository.save(assistantMessage);

        log.info("[ChatService] chatId={} projectId={} response saved", chatId, session.getProject().getId());
        return assistantMessage;
    }

    public List<Message> getMessages(Long chatId) {
        findOwnedChat(chatId);
        return messageRepository.findByChatSessionId(chatId);
    }

    public List<ChatSession> getChats(Long projectId) {
        projectService.findOwnedProject(projectId);
        return chatSessionRepository.findByProjectId(projectId);
    }

    public void deleteChat(Long chatId) {
        findOwnedChat(chatId);
        messageRepository.deleteAll(messageRepository.findByChatSessionId(chatId));
        chatSessionRepository.deleteById(chatId);
    }

    private ChatSession findOwnedChat(Long chatId) {
        ChatSession session = chatSessionRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found: " + chatId));
        projectService.findOwnedProject(session.getProject().getId()); // ownership check
        return session;
    }
}
