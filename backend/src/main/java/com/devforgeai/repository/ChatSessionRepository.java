package com.devforgeai.repository;

import com.devforgeai.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByProjectId(Long projectId);
}