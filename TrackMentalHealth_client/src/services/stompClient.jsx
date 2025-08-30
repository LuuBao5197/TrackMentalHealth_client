import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';

let client;
let isConnected = false;

export function connectWebSocket({
    sessionId,
    groupId,
    callId,              // giữ lại callId
    onPrivateMessage,
    onGroupMessage,
    onNotification,
    onCallSignal         // giữ lại callback signal
}) {
    const currentUserId = getCurrentUserId();
    console.log("🧪 connectWebSocket:", { sessionId, groupId, callId, currentUserId });

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ WebSocket connected");
            isConnected = true;

            // 🔹 Private chat
            client.subscribe(`/user/${currentUserId}/queue/messages`, (msg) => {
                if (msg.body) onPrivateMessage?.(JSON.parse(msg.body));
            });

            if (sessionId) {
                client.subscribe(`/topic/chat/${sessionId}`, (msg) => {
                    if (msg.body) onPrivateMessage?.(JSON.parse(msg.body));
                });
            }

            // 🔹 Group chat
            if (groupId) {
                client.subscribe(`/topic/group/${groupId}`, (msg) => {
                    if (msg.body) onGroupMessage?.(JSON.parse(msg.body));
                });
            }

            // 🔹 Call signal (chỉ giữ tầng signal, bỏ UI/video)
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
                if (msg.body) onNotification?.(JSON.parse(msg.body));
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

// ✅ Chỉ gửi signal, không dính UI video call
export function sendCallSignal(callId, payload) {
    if (client && client.connected) {
        client.publish({
            destination: `/app/call/${callId}`,
            body: JSON.stringify(payload)
        });
        console.log("📤 Sent call signal:", { callId, payload });
    } else {
        console.error("🚫 WebSocket chưa kết nối khi gửi call signal:", { callId, payload });
        // Retry nhẹ sau 300ms
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
