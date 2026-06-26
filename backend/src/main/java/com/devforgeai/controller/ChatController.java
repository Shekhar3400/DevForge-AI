package com.devforgeai.controller;

import com.devforgeai.dto.CreateChatRequest;
import com.devforgeai.dto.SendMessageRequest;
import com.devforgeai.entity.ChatSession;
import com.devforgeai.entity.Message;
import com.devforgeai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/create")
    public ChatSession createChat(
            @RequestBody CreateChatRequest request) {

        return chatService.createChat(request);
    }

    @PostMapping("/{chatId}/send")
    public Message sendMessage(
            @PathVariable Long chatId,
            @RequestBody SendMessageRequest request) {

        return chatService.sendMessage(
                chatId,
                request);
    }

    @GetMapping("/{chatId}/messages")
    public List<Message> getMessages(
            @PathVariable Long chatId) {

        return chatService.getMessages(chatId);
    }

    @GetMapping("/project/{projectId}")
    public List<ChatSession> getChats(
            @PathVariable Long projectId) {

        return chatService.getChats(projectId);
    }

    @DeleteMapping("/{chatId}")
    public void deleteChat(
            @PathVariable Long chatId) {

        chatService.deleteChat(chatId);
    }
}