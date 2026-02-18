import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/ws`
    : 'http://localhost:8080/ws';

export const useRealTime = (topics = [], onMessage) => {
    const clientRef = useRef(null);
    const connectedRef = useRef(false);

    useEffect(() => {
        if (!topics || topics.length === 0) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                connectedRef.current = true;

                topics.forEach(topic => {
                    client.subscribe(topic, (message) => {
                        try {
                            const body = JSON.parse(message.body);
                            if (onMessage) onMessage(topic, body);
                        } catch (e) {
                            console.error('Error parsing WebSocket message', e);
                            if (onMessage) onMessage(topic, message.body);
                        }
                    });
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                console.log('WebSocket connection closed');
                connectedRef.current = false;
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [JSON.stringify(topics)]);

    return connectedRef.current;
};
