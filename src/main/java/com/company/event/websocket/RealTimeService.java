package com.company.event.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RealTimeService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyNewRegistration(String eventId, Object registrationData) {
        messagingTemplate.convertAndSend(
                "/topic/events/" + eventId + "/registrations",
                registrationData);
    }

    public void notifyEventUpdate(String eventId, Object eventData) {
        messagingTemplate.convertAndSend(
                "/topic/events/" + eventId,
                eventData);
    }

    public void notifyExamStatus(String eventId, String status) {
        messagingTemplate.convertAndSend(
                "/topic/events/" + eventId + "/exam",
                Map.of("status", status, "eventId", eventId));
    }

    public void notifyAdminAssignment(String orgId, Object adminData) {
        messagingTemplate.convertAndSend(
                "/topic/org/" + orgId + "/admins",
                adminData);
    }

    public void broadcastDashboardUpdate(Object data) {
        messagingTemplate.convertAndSend("/topic/dashboard", data);
    }
}
