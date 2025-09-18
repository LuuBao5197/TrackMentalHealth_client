# 🔧 Message Update Fix Verification

## Vấn đề từ Log
```
📩 New message: {message: 'alo', senderId: 3, senderName: 'psychologist'}
```

**Phân tích:**
- Tin nhắn đi qua `/topic/messages/1` → `onNewMessage` callback
- Không có `sessionId` trong tin nhắn
- Chỉ hiển thị toast, không cập nhật UI

## Root Cause
1. **Backend gửi tin nhắn qua wrong topic** - `/topic/messages/{userId}` thay vì `/topic/chat/{sessionId}`
2. **onNewMessage không cập nhật state** - chỉ hiển thị toast
3. **Tin nhắn không có sessionId** - khó xác định thuộc session nào

## Fixes Applied

### 1. **Sửa onNewMessage để cập nhật state**
```javascript
onNewMessage: (msg) => {
  console.log("📩 UserLayout received new message:", msg);
  showToast(`New message from ${msg.senderName}`, "info");
  
  // Xử lý tin nhắn private nếu có đủ thông tin
  if (msg.message && msg.senderName && msg.senderId) {
    console.log("📩 Processing new message as private message");
    
    // Cập nhật privateMessages state
    setPrivateMessages(prev => {
      const newMessages = [...prev, msg];
      console.log("📩 Updated privateMessages from onNewMessage:", newMessages);
      return newMessages;
    });
  }
},
```

### 2. **Sửa ChatWithUser để xử lý tin nhắn không có sessionId**
```javascript
const newMessages = privateMessages.filter(msg => {
  const messageSessionId = msg.session?.id || msg.sessionId;
  // Nếu tin nhắn có sessionId, kiểm tra match
  if (messageSessionId) {
    return messageSessionId == sessionId;
  }
  // Nếu tin nhắn không có sessionId (từ onNewMessage), 
  // xử lý tất cả tin nhắn (tạm thời)
  return true;
});
```

## Expected Console Output

Khi tin nhắn đến thành công:
```
📩 UserLayout received new message: {message: 'alo', senderId: 3, senderName: 'psychologist'}
📩 Processing new message as private message
📩 Updated privateMessages from onNewMessage: [{message: 'alo', senderId: 3, senderName: 'psychologist'}]
🔍 ChatWithUser useEffect triggered: {privateMessagesLength: 1, sessionId: "123", currentUserId: 1}
📩 Messages for current session: [{message: 'alo', senderId: 3, senderName: 'psychologist'}]
📩 Processing message: {message: 'alo', senderId: 3, senderName: 'psychologist'}
🔍 Sender check: {messageSenderId: 3, currentUserId: 1, isSenderCurrentUser: false}
➕ Adding new message from others
```

## Test Steps

### ✅ Test Case 1: Tin nhắn từ psychologist
1. Mở chat với psychologist
2. Psychologist gửi tin nhắn "alo"
3. **Expected**: 
   - Toast hiển thị "New message from psychologist"
   - Tin nhắn "alo" hiển thị trong chat UI
   - Console logs theo expected output

### ✅ Test Case 2: Tin nhắn từ user khác
1. Mở chat private với user khác
2. User khác gửi tin nhắn
3. **Expected**: 
   - Toast hiển thị
   - Tin nhắn hiển thị trong chat UI

## Backend Issue (Cần sửa)

**Vấn đề**: Backend gửi tin nhắn qua `/topic/messages/{userId}` thay vì `/topic/chat/{sessionId}`

**Giải pháp**: Backend cần gửi tin nhắn qua đúng topic:
- Private chat: `/topic/chat/{sessionId}`
- Group chat: `/topic/group/{groupId}`
- General messages: `/topic/messages/{userId}` (cho notification)

## Temporary Workaround

Hiện tại đã sửa frontend để xử lý tin nhắn từ `/topic/messages/{userId}`, nhưng đây chỉ là workaround tạm thời. Backend cần được sửa để gửi tin nhắn qua đúng topic.

## Kết quả
- ✅ Tin nhắn từ onNewMessage hiển thị trong UI
- ✅ Toast vẫn hoạt động bình thường
- ✅ Debug logs chi tiết
- ⚠️ Workaround tạm thời (cần sửa backend)
