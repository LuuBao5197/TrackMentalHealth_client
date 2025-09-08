import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';
import { showToast } from '../utils/showToast';

let client;
let isConnected = false;

export function connectWebSocket({
    groupId,
    onPrivateMessage,
    onGroupMessage,
    onNotification,
    onCallSignal, // callback cho call signal
}) {
    const currentUserId = getCurrentUserId();
    console.log("connectWebSocket params:", { groupId, currentUserId });

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ WebSocket connected");
            isConnected = true;

            // 🔹 1-1 chat cho tất cả session của user
            client.subscribe(`/topic/messages/${currentUserId}`, (msg) => {
                if (msg.body) {
                    const data = JSON.parse(msg.body);
                    console.log("📩 New 1-1 message:", data);
                    showToast("New message from "+data.senderName)
                    onPrivateMessage?.(data);
                }
            });

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

            // 🔹 Notifications
            client.subscribe(`/topic/notifications/${currentUserId}`, (msg) => {
                if (msg.body) {
                    const notif = JSON.parse(msg.body);
                    console.log("🔔 Notification:", notif);
                    onNotification?.(notif);
                }
            });

            // 🔹 Call signal cho user
            client.subscribe(`/topic/call/${currentUserId}`, (msg) => {
                if (msg.body) {
                    const data = JSON.parse(msg.body);
                    console.log("📞 Call signal:", data);
                    onCallSignal?.(data);
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

// Gửi call signal
export function sendCallSignal(payload) {
    if (client && client.connected) {
        client.publish({
            destination: `/app/call/${getCurrentUserId()}`,
            body: JSON.stringify(payload)
        });
        console.log("📤 Sent call signal:", payload);
    } else {
        console.error("🚫 WebSocket chưa kết nối khi gửi call signal:", payload);
    }
}

// Gửi tin nhắn 1-1
export function sendWebSocketMessage(destination, messageObj) {
    if (client && client.connected) {
        client.publish({
            destination,
            body: JSON.stringify(messageObj),
        });
        console.log(`📤 Sent WS message to [${destination}]`, messageObj);
    } else {
        console.error("🚫 WebSocket not connected:", messageObj);
    }
}

