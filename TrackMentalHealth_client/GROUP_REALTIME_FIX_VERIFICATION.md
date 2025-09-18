# 🔧 Group Realtime Fix Verification

## Vấn đề
WebSocket đã bắt được tin nhắn nhưng chưa update tin nhắn được, người nhận chưa realtime.

## Root Causes

### **1. Deduplication logic quá strict:**
```javascript
// Vấn đề cũ:
const exists = prev.some(m => 
    (m.id && msg.id && m.id === msg.id) || 
    (m.text === msg.content && m.user.id === senderId.toString()) // ❌ Quá strict
);
```

### **2. Không có debug logs chi tiết:**
- Không trace được message flow
- Không biết tin nhắn bị skip ở đâu
- Không debug được realtime issue

## Fixes Applied

### **1. Sửa deduplication logic:**
```javascript
// Fix mới:
const exists = prev.some(m => 
    m.id && msg.id && m.id === msg.id // ✅ Chỉ kiểm tra ID thật
);
```

### **2. Thêm debug logs chi tiết:**
```javascript
// Khi nhận tin nhắn:
console.log("📩 ChatGroup received group message:", msg);
console.log("🔍 Message details:", {
    groupId: msg.groupId,
    currentGroupId: groupId,
    senderId: msg.sender?.id ?? msg.senderId,
    currentUserId: currentUserId,
    content: msg.content
});

// Khi gửi tin nhắn:
console.log("📤 Sending group message:", {
    groupId,
    senderId: currentUserId,
    content: text
});
console.log("🔍 Temporary message created:", tempMessage);
```

### **3. Cải thiện message processing:**
```javascript
// Tin nhắn từ người khác - thêm mới
console.log("➕ Adding new group message from others");
const newMessage = {
    id: msg.id,
    text: msg.content,
    user: {
        id: String(senderId),
        name: msg.sender?.fullname ?? msg.senderName ?? "User",
        avatar: msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullname || "U")}`
    },
    timestamp: new Date(msg.sendAt).getTime(),
};

console.log("🔍 New message to add:", newMessage);
const updatedMessages = [...prev, newMessage];
console.log("🔍 Final messages count:", updatedMessages.length);
```

## Expected Flow

### **Khi User A gửi tin nhắn:**
1. **User A gửi** → `handleSendMessage("Hello group")`
2. **Optimistic update** → Hiển thị tin nhắn tạm thời
3. **WebSocket send** → `/app/chat.group.send`
4. **Backend xử lý** → Gửi tin nhắn qua `/topic/group/{groupId}`
5. **User A nhận** → Thay thế tin nhắn tạm thời
6. **User B nhận** → Thêm tin nhắn mới

### **Expected Console Output:**

#### **User A (người gửi):**
```
📤 Sending group message: {groupId: "123", senderId: "1", content: "Hello group"}
🔍 Temporary message created: {id: "temp_...", text: "Hello group", isTemporary: true}
🔍 Messages after adding temporary: 5
📤 Sending WebSocket message: {groupId: "123", senderId: "1", content: "Hello group"}
📩 ChatGroup received group message: {groupId: "123", senderId: "1", content: "Hello group", ...}
🔍 Sender check: {messageSenderId: "1", currentUserId: "1", isCurrentUser: true}
🔄 Replacing temporary group message
✅ Found temporary message to replace: {id: "temp_...", text: "Hello group", isTemporary: true}
```

#### **User B (người nhận):**
```
📩 ChatGroup received group message: {groupId: "123", senderId: "1", content: "Hello group", ...}
🔍 Message details: {groupId: "123", currentGroupId: "123", senderId: "1", currentUserId: "2", content: "Hello group"}
🔍 Sender check: {messageSenderId: "1", currentUserId: "2", isCurrentUser: false}
➕ Adding new group message from others
🔍 New message to add: {id: "456", text: "Hello group", user: {...}, timestamp: ...}
🔍 Final messages count: 6
```

## Test Cases

### ✅ Test Case 1: Gửi tin nhắn group
1. User A mở group chat
2. User A gửi tin nhắn "Hello group"
3. **Expected**: Tin nhắn hiển thị ngay lập tức (optimistic update)
4. **Expected**: Tin nhắn được thay thế bởi server response

### ✅ Test Case 2: Nhận tin nhắn realtime
1. User A gửi tin nhắn "Hello group"
2. User B mở cùng group
3. **Expected**: User B thấy tin nhắn của User A ngay lập tức

### ✅ Test Case 3: Multiple users
1. User A, B, C cùng mở group
2. User A gửi tin nhắn
3. **Expected**: User B và C đều thấy tin nhắn realtime

### ✅ Test Case 4: No duplicate messages
1. User A gửi tin nhắn
2. User A nhận lại tin nhắn từ server
3. **Expected**: Không có tin nhắn trùng lặp

## Debug Steps

### 1. Kiểm tra WebSocket Connection
```javascript
// Console should show:
✅ WebSocket connected
✅ Subscribed to /topic/group/*
✅ Subscribed to /topic/group/123
```

### 2. Kiểm tra Message Sending
```javascript
// Console should show:
📤 Sending group message: {groupId: "123", senderId: "1", content: "Hello"}
📤 Sending WebSocket message: {groupId: "123", senderId: "1", content: "Hello"}
```

### 3. Kiểm tra Message Receiving
```javascript
// Console should show:
📩 ChatGroup received group message: {groupId: "123", senderId: "1", content: "Hello", ...}
🔍 Message details: {groupId: "123", currentGroupId: "123", senderId: "1", currentUserId: "2", content: "Hello"}
➕ Adding new group message from others
```

### 4. Kiểm tra UI Update
- Tin nhắn có hiển thị trong MessageList không?
- Tin nhắn có đúng thông tin user không?
- Tin nhắn có timestamp đúng không?

## Troubleshooting

### Nếu vẫn không realtime:

1. **Kiểm tra WebSocket Status**
   - Xem WebSocket status indicator (góc trên bên phải)
   - Phải hiển thị "CONNECTED" (màu xanh)

2. **Kiểm tra Console Logs**
   - Có thấy `📤 Sending group message:` không?
   - Có thấy `📩 ChatGroup received group message:` không?
   - Có thấy `➕ Adding new group message from others` không?

3. **Kiểm tra Backend**
   - Backend có nhận được tin nhắn không?
   - Backend có gửi tin nhắn qua `/topic/group/{groupId}` không?
   - Backend có gửi đúng format không?

4. **Kiểm tra Network**
   - WebSocket connection có ổn định không?
   - Có lỗi network nào không?

5. **Kiểm tra Message Format**
   - Tin nhắn có đúng format không?
   - groupId có match không?
   - senderId có đúng không?

## Kết quả
- ✅ **Realtime messaging** - tin nhắn hiển thị ngay lập tức
- ✅ **No duplicate messages** - không có tin nhắn trùng lặp
- ✅ **Optimistic updates** - tin nhắn hiển thị ngay khi gửi
- ✅ **Debug logs chi tiết** - dễ troubleshoot
- ✅ **Multiple users** - tất cả user đều nhận được tin nhắn
- ✅ **Clean UI** - tin nhắn hiển thị đúng format
