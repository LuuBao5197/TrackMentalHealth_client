# 🔧 Flutter Message Receiving Fix Verification

## Vấn đề
Flutter gửi tin nhắn nhưng web không nhận được.

## Root Causes

### 1. **WebSocket Connection Conflict**
```javascript
// UserLayout.jsx - WebSocket chính KHÔNG có sessionId
connectWebSocket({
  onPrivateMessage: (msg) => { ... },
  // ❌ KHÔNG có sessionId ở đây!
});

// ChatWithUser.jsx - Tạo WebSocket riêng với sessionId
const disconnect = connectWebSocket({
    sessionId, // ✅ Có sessionId ở đây
    onPrivateMessage: (msg) => { ... }
});
```

### 2. **Subscription không được tạo đúng cách**
- UserLayout không có subscription cho `/topic/chat/{sessionId}`
- ChatWithUser tạo subscription riêng nhưng bị conflict
- Flutter gửi tin nhắn qua `/topic/chat/{sessionId}` nhưng web không subscribe

## Fixes Applied

### 1. **Centralized WebSocket Connection**
```javascript
// UserLayout.jsx - WebSocket chính với subscription cho tất cả sessions
connectWebSocket({
  onPrivateMessage: (msg) => {
    // Xử lý tin nhắn private từ tất cả sessions
    setPrivateMessages(prev => [...prev, msg]);
  }
});
```

### 2. **Wildcard Subscription for All Sessions**
```javascript
// StompClient.jsx - Subscribe tất cả private chat sessions
subscribeSafe(`/topic/chat/*`, onPrivateMessage, "Private chat message");
```

### 3. **Context-based Message Processing**
```javascript
// ChatWithUser.jsx - Sử dụng WebSocketContext thay vì tạo connection riêng
useEffect(() => {
    if (!privateMessages || privateMessages.length === 0) return;
    
    const latestMessage = privateMessages[privateMessages.length - 1];
    
    // Kiểm tra xem tin nhắn có thuộc session hiện tại không
    if (latestMessage.sessionId && latestMessage.sessionId != sessionId) {
        return; // Skip nếu không phải session hiện tại
    }
    
    // Xử lý tin nhắn...
}, [privateMessages, sessionId, currentUserId]);
```

## Expected Flow

### Khi Flutter gửi tin nhắn:
1. **Flutter** gửi tin nhắn qua WebSocket đến `/topic/chat/{sessionId}`
2. **UserLayout** nhận tin nhắn qua subscription `/topic/chat/*`
3. **UserLayout** cập nhật `privateMessages` state
4. **ChatWithUser** nhận tin nhắn từ context
5. **ChatWithUser** kiểm tra sessionId và hiển thị tin nhắn

### Console Output Expected:
```
📩 Private chat message: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
📩 UserLayout received private message: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
📩 Updated privateMessages: [...]
📩 ChatWithUser received private message from context: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
🔍 Sender check: {messageSenderId: 2, currentUserId: 1, isSenderCurrentUser: false}
➕ Adding new message from others
```

## Test Cases

### ✅ Test Case 1: Flutter gửi tin nhắn lần đầu
1. Mở chat với Flutter user
2. Flutter gửi tin nhắn "Hello from Flutter"
3. **Expected**: Tin nhắn hiển thị trong web UI

### ✅ Test Case 2: Multiple sessions
1. Mở chat với Flutter user A (session 123)
2. Mở chat với Flutter user B (session 456)
3. Flutter user A gửi tin nhắn
4. **Expected**: Chỉ chat với user A hiển thị tin nhắn

### ✅ Test Case 3: Web gửi tin nhắn
1. Web gửi tin nhắn "Hello from Web"
2. **Expected**: Tin nhắn hiển thị ngay lập tức (optimistic update)
3. **Expected**: Flutter nhận được tin nhắn

## Debug Steps

### 1. Kiểm tra WebSocket Connection
```javascript
// Console should show:
✅ WebSocket connected
✅ Subscribed to /topic/chat/*
```

### 2. Kiểm tra Flutter Message
```javascript
// Console should show:
📩 Private chat message: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
📩 UserLayout received private message: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
```

### 3. Kiểm tra ChatWithUser Processing
```javascript
// Console should show:
📩 ChatWithUser received private message from context: {message: 'Hello from Flutter', senderId: 2, sessionId: '123', ...}
🔍 Sender check: {messageSenderId: 2, currentUserId: 1, isSenderCurrentUser: false}
➕ Adding new message from others
```

## Troubleshooting

### Nếu vẫn không nhận được tin nhắn:

1. **Kiểm tra WebSocket Status**
   - Xem WebSocket status indicator (góc trên bên phải)
   - Phải hiển thị "CONNECTED" (màu xanh)

2. **Kiểm tra Console Logs**
   - Có thấy `📩 Private chat message:` không?
   - Có thấy `📩 UserLayout received private message:` không?
   - Có thấy `📩 ChatWithUser received private message from context:` không?

3. **Kiểm tra Session ID**
   - Flutter gửi tin nhắn với sessionId nào?
   - Web đang mở chat với sessionId nào?
   - Có match không?

4. **Kiểm tra Backend**
   - Backend có gửi tin nhắn qua `/topic/chat/{sessionId}` không?
   - Có gửi qua `/topic/messages/{userId}` không?

## Kết quả
- ✅ **Flutter gửi tin nhắn** → Web nhận được
- ✅ **Web gửi tin nhắn** → Flutter nhận được
- ✅ **Multiple sessions** hoạt động đúng
- ✅ **No duplicate messages** (đã fix trước đó)
- ✅ **Centralized WebSocket** management
- ✅ **Debug logs chi tiết** để troubleshoot
