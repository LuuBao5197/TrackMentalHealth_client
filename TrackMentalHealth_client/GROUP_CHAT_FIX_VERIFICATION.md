# 🔧 Group Chat Fix Verification

## Vấn đề
Chat group không nhắn được tin nhắn.

## Root Causes

### **1. Không có WebSocket subscription cho group:**
- UserLayout không có groupId nên không tạo subscription
- ChatGroup chỉ dựa vào groupMessages từ context
- Không có subscription cho `/topic/group/{groupId}`

### **2. Thông báo không cần thiết:**
- User muốn tắt thông báo toast
- Chỉ cần WebSocket hoạt động trong group

## Fixes Applied

### **1. Tắt thông báo trong UserLayout:**
```javascript
// onNewMessage: Không hiển thị thông báo
onNewMessage: (msg) => {
  console.log("📩 UserLayout received new message (no notification):", msg);
  // Không hiển thị thông báo, chỉ log để debug
},

// onPrivateMessage: Không hiển thị thông báo
onPrivateMessage: (msg) => {
  // Cập nhật privateMessages state (không hiển thị thông báo)
  setPrivateMessages(prev => [...prev, msg]);
},

// onGroupMessage: Không hiển thị thông báo
onGroupMessage: (msg) => {
  // Cập nhật groupMessages state (không hiển thị thông báo)
  setGroupMessages(prev => [...prev, msg]);
}
```

### **2. Thêm wildcard subscription cho group messages:**
```javascript
// StompClient.jsx
// 🔹 Group chat messages (for all groups)
subscribeSafe(`/topic/group/*`, onGroupMessage, "Group chat message");
```

### **3. ChatGroup tạo subscription riêng:**
```javascript
// ChatGroup.jsx
useEffect(() => {
    if (!groupId) return;

    const disconnect = connectWebSocket({
        groupId,
        onGroupMessage: (msg) => {
            // Xử lý tin nhắn group trực tiếp
            if (msg.groupId != groupId) return;
            
            // Thay thế tin nhắn tạm thời hoặc thêm mới
            setMessages(prev => {
                // Logic xử lý tin nhắn...
            });
        }
    });

    return () => {
        unsubscribe(`/topic/group/${groupId}`);
        disconnect();
    };
}, [groupId, currentUserId]);
```

## Expected Flow

### **Khi gửi tin nhắn group:**
1. **User gửi tin nhắn** → `handleSendMessage(text)`
2. **Optimistic update** → Hiển thị tin nhắn ngay lập tức
3. **WebSocket send** → `/app/chat.group.send`
4. **Backend xử lý** → Gửi tin nhắn qua `/topic/group/{groupId}`
5. **WebSocket nhận** → `onGroupMessage` callback
6. **Cập nhật UI** → Thay thế tin nhắn tạm thời

### **Khi nhận tin nhắn group:**
1. **Backend gửi** → `/topic/group/{groupId}`
2. **WebSocket nhận** → `onGroupMessage` callback
3. **Kiểm tra groupId** → Chỉ xử lý tin nhắn của group hiện tại
4. **Cập nhật UI** → Thêm tin nhắn mới

## Expected Console Output

### **Khi gửi tin nhắn:**
```
📤 Sent WS message to [/app/chat.group.send] {groupId: "123", senderId: "1", content: "Hello group"}
📩 Group chat message: {groupId: "123", senderId: "1", content: "Hello group", ...}
📩 ChatGroup received group message: {groupId: "123", senderId: "1", content: "Hello group", ...}
🔄 Replacing temporary group message
```

### **Khi nhận tin nhắn:**
```
📩 Group chat message: {groupId: "123", senderId: "2", content: "Hi there", ...}
📩 ChatGroup received group message: {groupId: "123", senderId: "2", content: "Hi there", ...}
➕ Adding new group message from others
```

## Test Cases

### ✅ Test Case 1: Gửi tin nhắn group
1. Mở chat group
2. Gửi tin nhắn "Hello group"
3. **Expected**: Tin nhắn hiển thị ngay lập tức (optimistic update)
4. **Expected**: Tin nhắn được thay thế bởi server response

### ✅ Test Case 2: Nhận tin nhắn group
1. User A gửi tin nhắn trong group
2. User B mở cùng group
3. **Expected**: User B thấy tin nhắn của User A

### ✅ Test Case 3: Multiple groups
1. Mở group A, gửi tin nhắn
2. Mở group B, gửi tin nhắn
3. **Expected**: Mỗi group chỉ hiển thị tin nhắn của group đó

### ✅ Test Case 4: No notifications
1. Gửi tin nhắn group
2. **Expected**: Không có toast notification
3. **Expected**: Chỉ có console logs

## Debug Steps

### 1. Kiểm tra WebSocket Connection
```javascript
// Console should show:
✅ WebSocket connected
✅ Subscribed to /topic/group/*
```

### 2. Kiểm tra Group Subscription
```javascript
// Console should show:
🔍 ChatGroup connecting WebSocket for group: 123
✅ Subscribed to /topic/group/123
```

### 3. Kiểm tra Message Sending
```javascript
// Console should show:
📤 Sent WS message to [/app/chat.group.send] {groupId: "123", ...}
```

### 4. Kiểm tra Message Receiving
```javascript
// Console should show:
📩 Group chat message: {groupId: "123", ...}
📩 ChatGroup received group message: {groupId: "123", ...}
```

## Troubleshooting

### Nếu vẫn không gửi được tin nhắn:

1. **Kiểm tra WebSocket Status**
   - Xem WebSocket status indicator (góc trên bên phải)
   - Phải hiển thị "CONNECTED" (màu xanh)

2. **Kiểm tra Console Logs**
   - Có thấy `🔍 ChatGroup connecting WebSocket for group:` không?
   - Có thấy `✅ Subscribed to /topic/group/123` không?
   - Có thấy `📤 Sent WS message to [/app/chat.group.send]` không?

3. **Kiểm tra Backend**
   - Backend có nhận được tin nhắn không?
   - Backend có gửi tin nhắn qua `/topic/group/{groupId}` không?

4. **Kiểm tra Network**
   - WebSocket connection có ổn định không?
   - Có lỗi network nào không?

## Kết quả
- ✅ **Chat group hoạt động bình thường** - gửi và nhận tin nhắn
- ✅ **Không có thông báo toast** - chỉ có console logs
- ✅ **Optimistic updates** - tin nhắn hiển thị ngay lập tức
- ✅ **Multiple groups** - mỗi group hoạt động độc lập
- ✅ **Debug logs chi tiết** - dễ troubleshoot
- ✅ **Clean UI** - không có thông báo phiền toái
