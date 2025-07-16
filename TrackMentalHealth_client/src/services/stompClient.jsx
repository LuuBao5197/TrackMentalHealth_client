import * as SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let client;

export function connectWebSocket(sessionId, onMessageReceived) {
    client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:9999/ws"),  // ✅ Dùng SockJS
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),
        onConnect: () => {
            console.log("✅ Kết nối WebSocket thành công");

            const topic = `/topic/chat/${sessionId}`;
            client.subscribe(topic, (message) => {
                console.log("📩 Tin nhắn đến:", message.body);
                if (message.body) {
                    const msgObj = JSON.parse(message.body);
                    onMessageReceived(msgObj);
                }
            });
        },
        onStompError: (frame) => {
            console.error("💥 STOMP lỗi:", frame.headers['message']);
        },
        onWebSocketError: (err) => {
            console.error("🛑 WebSocket lỗi:", err);
        }
    });

    client.activate();

    return () => {
        console.warn("👋 Đóng WebSocket client...");
        client.deactivate();
    };
}

export function sendWebSocketMessage(destination, messageObj) {
    if (client && client.connected) {
        console.log(`📤 Gửi WebSocket đến [${destination}]:`, messageObj);
        client.publish({
            destination,
            body: JSON.stringify(messageObj)
        });
    } else {
        console.error("🚫 WebSocket chưa kết nối.");
    }
}
