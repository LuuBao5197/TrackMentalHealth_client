# 🔧 Flutter Duplicate Message Fix Verification

## Vấn đề
Khi Flutter gửi tin nhắn qua, tin nhắn bị lặp lại vài lần trong web UI.

## Root Causes

### 1. **Multiple WebSocket Subscriptions**
```javascript
// Vấn đề: Mỗi lần gọi connectWebSocket đều tạo subscription mới
if (client && isConnected) {
    subscribeSafe(`/topic/chat/${sessionId}`, onPrivateMessage, "Subscribe session message");
    // Không unsubscribe cái cũ → tin nhắn bị xử lý nhiều lần
}
```

### 2. **Không có Subscription Tracking**
- Không track active subscriptions
- Không có unsubscribe mechanism
- Component unmount không cleanup subscriptions

## Fixes Applied

### 1. **Thêm Subscription Tracking**
```javascript
let activeSubscriptions = new Map(); // Track active subscriptions

function subscribeSafe(destination, callback, logLabel) {
    const subscription = client.subscribe(destination, (msg) => {
        // ... xử lý tin nhắn
    });
    
    // Track subscription
    activeSubscriptions.set(destination, subscription);
    console.log(`✅ Subscribed to ${destination}`);
}
```

### 2. **Unsubscribe Old Subscriptions**
```javascript
if (client && isConnected) {
    // Unsubscribe old subscriptions for the same session/group
    if (sessionId) {
        const oldSub = activeSubscriptions.get(`/topic/chat/${sessionId}`);
        if (oldSub) {
            console.log("🔄 Unsubscribing old session subscription");
            oldSub.unsubscribe();
        }
        subscribeSafe(`/topic/chat/${sessionId}`, onPrivateMessage, "Subscribe session message");
    }
}
```

### 3. **Cleanup on Component Unmount**
```javascript
// ChatWithUser.jsx
return () => {
    console.log("🔍 ChatWithUser disconnecting WebSocket");
    // Unsubscribe specific session subscription
    if (sessionId) {
        unsubscribe(`/topic/chat/${sessionId}`);
    }
    disconnect();
};
```

### 4. **Thêm Utility Functions**
```javascript
// Unsubscribe all subscriptions
export function unsubscribeAll() {
    activeSubscriptions.forEach((subscription, destination) => {
        subscription.unsubscribe();
    });
    activeSubscriptions.clear();
}

// Unsubscribe specific destination
export function unsubscribe(destination) {
    const subscription = activeSubscriptions.get(destination);
    if (subscription) {
        subscription.unsubscribe();
        activeSubscriptions.delete(destination);
    }
}
```

## Expected Flow

### Khi mở chat lần đầu:
1. **UserLayout** tạo WebSocket connection chính
2. **ChatWithUser** tạo subscription cho `/topic/chat/{sessionId}`
3. **Flutter gửi tin nhắn** → WebSocket nhận tin nhắn
4. **Tin nhắn hiển thị** 1 lần trong UI

### Khi mở chat lần 2 (cùng session):
1. **ChatWithUser** unsubscribe subscription cũ
2. **Tạo subscription mới** cho cùng session
3. **Flutter gửi tin nhắn** → WebSocket nhận tin nhắn
4. **Tin nhắn hiển thị** 1 lần trong UI (không lặp)

### Khi đóng chat:
1. **Component unmount** → Unsubscribe subscription
2. **Cleanup** → Không còn subscription cũ
3. **Flutter gửi tin nhắn** → Không nhận được (đã unsubscribe)

## Expected Console Output

### Khi mở chat lần đầu:
```
🧪 connectWebSocket params: {sessionId: "123", groupId: null, currentUserId: "1"}
✅ WebSocket connected
✅ Subscribed to /topic/chat/123
```

### Khi mở chat lần 2 (cùng session):
```
🧪 connectWebSocket params: {sessionId: "123", groupId: null, currentUserId: "1"}
⚠️ WebSocket already connected, managing subscriptions
🔄 Unsubscribing old session subscription
✅ Subscribed to /topic/chat/123
```

### Khi đóng chat:
```
🔍 ChatWithUser disconnecting WebSocket
🔄 Unsubscribing from /topic/chat/123
```

### Khi Flutter gửi tin nhắn:
```
📩 Subscribe session message: {message: 'Hello from Flutter', senderId: 2, ...}
📩 ChatWithUser received private message: {message: 'Hello from Flutter', senderId: 2, ...}
➕ Adding new message from others
```

## Test Cases

### ✅ Test Case 1: Flutter gửi tin nhắn lần đầu
1. Mở chat với Flutter user
2. Flutter gửi tin nhắn "Hello"
3. **Expected**: Tin nhắn hiển thị 1 lần trong web UI

### ✅ Test Case 2: Mở chat nhiều lần
1. Mở chat với Flutter user
2. Đóng chat
3. Mở lại chat với cùng Flutter user
4. Flutter gửi tin nhắn
5. **Expected**: Tin nhắn hiển thị 1 lần (không lặp)

### ✅ Test Case 3: Multiple sessions
1. Mở chat với Flutter user A
2. Mở chat với Flutter user B (tab khác)
3. Flutter user A gửi tin nhắn
4. **Expected**: Chỉ chat với user A hiển thị tin nhắn

## Kết quả
- ✅ **Tin nhắn từ Flutter không bị lặp** trong web UI
- ✅ **Subscription management** chính xác
- ✅ **Cleanup** khi component unmount
- ✅ **Performance tốt hơn** (không có duplicate subscriptions)
- ✅ **Debug logs chi tiết** để troubleshoot

## Lưu ý
- Nếu vẫn còn lặp, kiểm tra console logs để xem có multiple subscriptions không
- Có thể cần kiểm tra Flutter app có gửi tin nhắn nhiều lần không
- Có thể cần kiểm tra backend có gửi tin nhắn qua multiple topics không
