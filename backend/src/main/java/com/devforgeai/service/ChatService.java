package com.devforgeai.service;

import com.devforgeai.ai.AiProvider;
import com.devforgeai.dto.CreateChatRequest;
import com.devforgeai.dto.SendMessageRequest;
import com.devforgeai.entity.ChatSession;
import com.devforgeai.entity.Message;
import com.devforgeai.entity.Project;
import com.devforgeai.repository.ChatSessionRepository;
import com.devforgeai.repository.MessageRepository;
import com.devforgeai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;

    private final ProjectContextService projectContextService;
    private final AiProvider aiProvider;

    public ChatSession createChat(CreateChatRequest request) {

        Project project = projectRepository.findById(
                request.getProjectId()
        ).orElseThrow(() ->
                new RuntimeException("Project not found"));

        ChatSession session = ChatSession.builder()
                .title(request.getTitle())
                .project(project)
                .build();

        return chatSessionRepository.save(session);
    }

    public Message sendMessage(
            Long chatId,
            SendMessageRequest request
    ) {

        ChatSession session = chatSessionRepository.findById(chatId)
                .orElseThrow(() ->
                        new RuntimeException("Chat not found"));

        // Save User Message
        Message userMessage = Message.builder()
                .chatSession(session)
                .role("USER")
                .content(request.getContent())
                .build();

        messageRepository.save(userMessage);

        // Fetch Project Context
        String projectContext =
                projectContextService.getProjectContext(
                        session.getProject().getId()
                );

        // Generate AI Response
        String aiResponse =
                aiProvider.generateResponse(
                        projectContext,
                        request.getContent()
                );

        // Save Assistant Message
        Message assistantMessage = Message.builder()
                .chatSession(session)
                .role("ASSISTANT")
                .content(aiResponse)
                .build();

        messageRepository.save(assistantMessage);

        return assistantMessage;
    }

    public List<Message> getMessages(Long chatId) {

        return messageRepository.findByChatSessionId(chatId);
    }

    public List<ChatSession> getChats(Long projectId) {

        return chatSessionRepository.findByProjectId(projectId);
    }

    public void deleteChat(Long chatId) {

        messageRepository.deleteAll(
                messageRepository.findByChatSessionId(chatId)
        );

        chatSessionRepository.deleteById(chatId);
    }
}