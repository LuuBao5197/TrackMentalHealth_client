import { Client } from '@stomp/stompjs';
import { getCurrentUserId } from '../utils/getCurrentUserID';

let client;
let isConnected = false;
let pendingSubscriptions = [];
let pendingCallSignals = [];
let activeSubscriptions = new Map(); // Track active subscriptions

export function connectWebSocket({
    sessionId,
    groupId,
    onPrivateMessage,
    onGroupMessage,
    onNotification,
    onCallSignal,
    onNewMessage,
    onConnect,
    onDisconnect,
    onError
}) {
    const currentUserId = getCurrentUserId();
    console.log("🧪 connectWebSocket params:", { sessionId, groupId, currentUserId });

    if (client && isConnected) {
        console.warn("⚠️ WebSocket already connected, managing subscriptions");
        
        // Unsubscribe old subscriptions for the same session/group
        if (sessionId) {
            const oldSub = activeSubscriptions.get(`/topic/chat/${sessionId}`);
            if (oldSub) {
                console.log("🔄 Unsubscribing old session subscription");
                oldSub.unsubscribe();
            }
            subscribeSafe(`/topic/chat/${sessionId}`, onPrivateMessage, "Subscribe session message");
        }
        if (groupId) {
            const oldSub = activeSubscriptions.get(`/topic/group/${groupId}`);
            if (oldSub) {
                console.log("🔄 Unsubscribing old group subscription");
                oldSub.unsubscribe();
            }
            subscribeSafe(`/topic/group/${groupId}`, onGroupMessage, "Group message");
        }
        return () => {}; // Không deactivate để giữ kết nối
    }

    client = new Client({
        webSocketFactory: () => new WebSocket("/ws"),
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP DEBUG]', str),

        onConnect: () => {
            console.log("✅ WebSocket connected");
            isConnected = true;

            // 🔹 Gửi các call signal pending
            pendingCallSignals.forEach(fn => fn());
            pendingCallSignals = [];

            // 🔹 Thực hiện các subscription pending
            pendingSubscriptions.forEach(sub => sub());
            pendingSubscriptions = [];

            // 🔹 1-1 session chat
            if (sessionId) {
                subscribeSafe(`/topic/chat/${sessionId}`, onPrivateMessage, "Subscribe session message");
            }

            // 🔹 Group chat
            if (groupId) {
                subscribeSafe(`/topic/group/${groupId}`, onGroupMessage, "Group message");
            }

            // 🔹 Call signal theo userId
            subscribeSafe(`/topic/call/${currentUserId}`, onCallSignal, "Call signal");

            // 🔹 Private messages
            subscribeSafe(`/topic/messages/${currentUserId}`, onNewMessage, "New message");
            
            // 🔹 Private chat messages (for all sessions)
            subscribeSafe(`/topic/chat/*`, onPrivateMessage, "Private chat message");

            // 🔹 Notifications
            subscribeSafe(`/topic/notifications/${currentUserId}`, onNotification, "Notification");

            // 🔹 Callback onConnect
            if (onConnect) {
                onConnect();
            }
        },

        onStompError: (frame) => {
            console.error("💥 STOMP error:", frame.headers['message'], frame.body);
            isConnected = false;
            if (onError) {
                onError(frame);
            }
        },
        onWebSocketError: (err) => {
            console.error("🛑 WebSocket error:", err);
            isConnected = false;
            if (onError) {
                onError(err);
            }
        },
        onDisconnect: () => {
            console.log("❌ WebSocket disconnected");
            isConnected = false;
            if (onDisconnect) {
                onDisconnect();
            }
        }
    });

    function subscribeSafe(destination, callback, logLabel) {
        const subscribeFn = () => {
            if (!callback) return;
            const subscription = client.subscribe(destination, (msg) => {
                if (msg.body) {
                    const data = JSON.parse(msg.body);
                    console.log(`📩 ${logLabel}:`, data);
                    callback(data);
                }
            });
            
            // Track subscription
            activeSubscriptions.set(destination, subscription);
            console.log(`✅ Subscribed to ${destination}`);
        };

        if (client.connected) {
            subscribeFn();
        } else {
            pendingSubscriptions.push(subscribeFn);
        }
    }

    client.activate();

    return () => {
        console.warn("👋 WebSocket disconnect called, nhưng không deactivate để giữ kết nối");
    };
}

// Gửi tin nhắn thông thường
export function sendWebSocketMessage(destination, messageObj) {
    if (client?.connected) {
        client.publish({ destination, body: JSON.stringify(messageObj) });
        console.log(`📤 Sent WS message to [${destination}]`, messageObj);
    } else {
        console.error("🚫 WebSocket not connected.");
    }
}

// Gửi call signal theo userId
export function sendCallSignal(payload) {
  const sendFn = () => {
    client.publish({
      destination: `/app/call/${payload.calleeId}`, // ✅ backend đang dùng @MessageMapping("/call/{userId}")
      body: JSON.stringify(payload),
    });
    console.log("📤 Sent call signal:", payload);
  };

  if (client?.connected) {
    sendFn();
  } else {
    console.warn("🚫 WebSocket chưa connect, lưu call signal vào queue", payload);
    pendingCallSignals.push(sendFn);
  }
}

// Unsubscribe all subscriptions
export function unsubscribeAll() {
  console.log("🔄 Unsubscribing all active subscriptions");
  activeSubscriptions.forEach((subscription, destination) => {
    console.log(`🔄 Unsubscribing from ${destination}`);
    subscription.unsubscribe();
  });
  activeSubscriptions.clear();
}

// Unsubscribe specific destination
export function unsubscribe(destination) {
  const subscription = activeSubscriptions.get(destination);
  if (subscription) {
    console.log(`🔄 Unsubscribing from ${destination}`);
    subscription.unsubscribe();
    activeSubscriptions.delete(destination);
  }
}

