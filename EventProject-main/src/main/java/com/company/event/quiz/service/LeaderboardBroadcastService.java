package com.company.event.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LeaderboardBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastUpdate(String eventId, Object leaderboardData) {
        messagingTemplate.convertAndSend("/topic/leaderboard/" + eventId, leaderboardData);
    }
}
