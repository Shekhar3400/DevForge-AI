package com.devforgeai.repository;

import com.devforgeai.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findByChatSessionId(Long chatSessionId);
}