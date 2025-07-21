import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';

let client;

export function connectWebSocket({ sessionId, groupId, onPrivateMessage, onGroupMessage, onNotification }) {
    const currentUserId = getCurrentUserId();
    console.log("🧪 connectWebSocket gọi với:", { sessionId, groupId, currentUserId });

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ Kết nối WebSocket thành công");
            // 💬 Chat 1-1
            if (sessionId) {
                client.subscribe(`/topic/chat/${sessionId}`, (message) => {
                    if (message.body) {
                        const msgObj = JSON.parse(message.body);
                        console.log("📩 Tin nhắn riêng đến:", msgObj);
                        onPrivateMessage?.(msgObj);
                    }
                });
            }

            // 👥 Chat nhóm
            if (groupId) {
                client.subscribe(`/topic/group/${groupId}`, (message) => {
                    if (message.body) {
                        const groupMsg = JSON.parse(message.body);
                        console.log("👥 Tin nhắn nhóm đến:", groupMsg);
                        onGroupMessage?.(groupMsg);
                    }
                });
            }

            // 🔔 Notification (dù là chat 1-1 hay nhóm đều nhận)
           client.subscribe(`/topic/notifications/${currentUserId}`, (message) => {
            if (message.body) {
                const notification = JSON.parse(message.body);
                console.log("📥 Nhận thông báo:", notification);
                onNotification?.(notification); // Gọi callback bên ngoài
            }
        });

        },

        onStompError: (frame) => {
            console.error("💥 STOMP lỗi:", frame.headers['message']);
            console.error("🔍 Chi tiết:", frame.body);
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
