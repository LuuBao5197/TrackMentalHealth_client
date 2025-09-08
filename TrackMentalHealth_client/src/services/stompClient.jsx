import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';

let client;
let isConnected = false;

export function connectWebSocket({
    sessionId,
    groupId,
    callId,
    onPrivateMessage,
    onGroupMessage,
    onNotification,
    onCallSignal
}) {
    const currentUserId = getCurrentUserId();
    console.log("🧪 connectWebSocket params:", { sessionId, groupId, callId, currentUserId });

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ WebSocket connected");
            isConnected = true;

            // 🔹 Session chat (1-1) - dùng topic riêng nếu server publish về /topic/chat/{sessionId}
            if (sessionId) {
                client.subscribe(`/topic/chat/${sessionId}`, (msg) => {
                    if (msg.body) {
                        const data = JSON.parse(msg.body);
                        console.log("💬 Session message:", data);
                        onPrivateMessage?.(data); // hoặc callback riêng nếu muốn tách
                    }
                });
            }

            // 🔹 Group chat
            if (groupId) {
                client.subscribe(`/topic/group/${groupId}`, (msg) => {
                    if (msg.body) {
                        const data = JSON.parse(msg.body);
                        console.log("👥 Group message:", data);
                        onGroupMessage?.(data);
                    }
                });
            }

            // 🔹 Call signal
            if (callId) {
                client.subscribe(`/topic/call/${callId}`, (msg) => {
                    if (msg.body) {
                        const signal = JSON.parse(msg.body);
                        console.log("📞 Call signal:", signal);
                        onCallSignal?.(signal);
                    }
                });
            }

            // 🔹 Notifications
            client.subscribe(`/topic/notifications/${currentUserId}`, (msg) => {
                if (msg.body) {
                    const notif = JSON.parse(msg.body);
                    console.log("🔔 Notification:", notif);
                    onNotification?.(notif);
                }
            });
        },

        onStompError: (frame) => {
            console.error("💥 STOMP error:", frame.headers['message'], frame.body);
        },
        onWebSocketError: (err) => {
            console.error("🛑 WebSocket error:", err);
        }
    });

    client.activate();

    return () => {
        isConnected = false;
        console.warn("👋 WebSocket disconnected");
        client.deactivate();
    };
}

export function sendWebSocketMessage(destination, messageObj) {
    if (client && client.connected) {
        client.publish({
            destination,
            body: JSON.stringify(messageObj)
        });
        console.log(`📤 Sent WS message to [${destination}]`, messageObj);
    } else {
        console.error("🚫 WebSocket not connected.");
    }
}

export function sendCallSignal(callId, payload) {
    if (client && client.connected) {
        client.publish({
            destination: `/app/call/${callId}`,
            body: JSON.stringify(payload)
        });
        console.log("📤 Sent call signal:", { callId, payload });
    } else {
        console.error("🚫 WebSocket chưa kết nối khi gửi call signal:", { callId, payload });
        setTimeout(() => {
            if (client?.connected) {
                client.publish({
                    destination: `/app/call/${callId}`,
                    body: JSON.stringify(payload)
                });
                console.log("📤 Retry sent call signal:", { callId, payload });
            }
        }, 300);
    }
}
