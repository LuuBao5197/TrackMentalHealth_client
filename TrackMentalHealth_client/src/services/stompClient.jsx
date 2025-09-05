import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';

let client;
let isConnected = false;

export function connectWebSocket({
    sessionId,
    groupId,
    callId,           // ✅ đổi từ videoCallId -> callId
    onPrivateMessage,
    onGroupMessage,
    onNotification,
    onCallSignal      // ✅ đổi từ onVideoSignal -> onCallSignal
}) {
    const currentUserId = getCurrentUserId();
    console.log("🧪 connectWebSocket gọi với:", { sessionId, groupId, callId, currentUserId });

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ Kết nối WebSocket thành công");
            isConnected = true;

            // 1-1 Chat
            if (sessionId) {
                client.subscribe(`/topic/chat/${sessionId}`, (message) => {
                    if (message.body) onPrivateMessage?.(JSON.parse(message.body));
                });
            }

            // Group Chat
            if (groupId) {
                client.subscribe(`/topic/group/${groupId}`, (message) => {
                    if (message.body) onGroupMessage?.(JSON.parse(message.body));
                });
            }

            // Video Call / Call Signal
            if (callId) {
                client.subscribe(`/topic/call/${callId}`, (message) => {
                    if (message.body) {
                        const signal = JSON.parse(message.body);
                        console.log("📞 Nhận tín hiệu call:", signal);
                        onCallSignal?.(signal);
                    }
                });
            }

            // Notification
            client.subscribe(`/topic/notifications/${currentUserId}`, (message) => {
                if (message.body) onNotification?.(JSON.parse(message.body));
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
        isConnected = false;
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

// Hàm gửi tín hiệu call
export function sendCallSignal(callId, payload) {
    if (client && client.connected) {
        console.log("📤 Gửi tín hiệu call:", {
            destination: `/app/call/${callId}`,
            payload
        });
        client.publish({
            destination: `/app/call/${callId}`,
            body: JSON.stringify(payload)
        });
    } else {
        console.error("🚫 WebSocket chưa kết nối khi gửi tín hiệu call:", {
            callId,
            payload,
            clientConnected: client?.connected
        });
        // Có thể retry sau 300ms
        setTimeout(() => {
            if (client?.connected) {
                client.publish({
                    destination: `/app/call/${callId}`,
                    body: JSON.stringify(payload)
                });
            }
        }, 300);
    }
}
