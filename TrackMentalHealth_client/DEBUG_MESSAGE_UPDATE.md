# 🔧 Debug Message Update Issue

## Vấn đề
Toast hiển thị có tin nhắn mới nhưng tin nhắn không tự cập nhật trong UI.

## Debug Steps

### 1. Mở Developer Console
- F12 → Console tab
- Xem các log messages

### 2. Kiểm tra WebSocket Connection
Tìm log: `✅ WebSocket connected in UserLayout`
- Nếu không có → WebSocket chưa kết nối
- Nếu có → WebSocket đã kết nối

### 3. Kiểm tra Tin nhắn đến
Khi có tin nhắn đến, tìm các log:
```
📩 UserLayout received private message: {...}
📩 Updated privateMessages: [...]
```

### 4. Kiểm tra ChatWithUser Processing
Tìm các log:
```
🔍 ChatWithUser useEffect triggered: {...}
📩 Messages for current session: [...]
📩 Processing message: {...}
➕ Adding new message from others
```

### 5. Kiểm tra Session ID Match
Tìm log:
```
🔍 Session comparison: {
  messageSessionId: "123",
  currentSessionId: "123", 
  match: true
}
```

## Các Vấn đề Có Thể Gặp

### ❌ Vấn đề 1: Session ID không match
**Log**: `❌ Message not for current session, ignoring`
**Giải pháp**: Kiểm tra sessionId trong URL và message

### ❌ Vấn đề 2: Tin nhắn đã tồn tại
**Log**: `❌ Message already exists, skipping`
**Giải pháp**: Tin nhắn đã được xử lý rồi

### ❌ Vấn đề 3: Không có tin nhắn cho session
**Log**: `❌ No messages for current session`
**Giải pháp**: Kiểm tra filter logic

### ❌ Vấn đề 4: WebSocket không nhận tin nhắn
**Log**: Không có `📩 UserLayout received private message`
**Giải pháp**: Kiểm tra WebSocket subscription

## Test Cases

### ✅ Test Case 1: Tin nhắn private đến
1. Mở 2 tab browser (2 user khác nhau)
2. User A gửi tin nhắn cho User B
3. Kiểm tra console logs:
   - UserLayout nhận tin nhắn
   - ChatWithUser xử lý tin nhắn
   - Tin nhắn hiển thị trong UI

### ✅ Test Case 2: Tin nhắn group đến
1. Mở group chat
2. User khác gửi tin nhắn trong group
3. Kiểm tra console logs:
   - UserLayout nhận group message
   - ChatGroup xử lý tin nhắn
   - Tin nhắn hiển thị trong UI

## Fixes Applied

### 1. **Improved Session ID Comparison**
```javascript
// Sử dụng == thay vì === để so sánh string và number
const messageSessionId = msg.session?.id || msg.sessionId;
return messageSessionId == sessionId;
```

### 2. **Process All New Messages**
```javascript
// Xử lý tất cả tin nhắn mới thay vì chỉ tin nhắn mới nhất
const newMessages = privateMessages.filter(msg => {
  const messageSessionId = msg.session?.id || msg.sessionId;
  return messageSessionId == sessionId;
});
```

### 3. **Enhanced Debug Logging**
- Thêm console.log chi tiết ở mỗi bước
- Log session comparison
- Log message processing steps

### 4. **Better Error Handling**
- Kiểm tra message validity
- Log invalid messages
- Better error messages

## Expected Console Output

Khi tin nhắn đến thành công:
```
📩 UserLayout received private message: {id: 123, message: "Hello", sessionId: "456", ...}
📩 Updated privateMessages: [{id: 123, message: "Hello", ...}]
🔍 ChatWithUser useEffect triggered: {privateMessagesLength: 1, sessionId: "456", ...}
📩 Messages for current session: [{id: 123, message: "Hello", ...}]
📩 Processing message: {id: 123, message: "Hello", ...}
🔍 Sender check: {messageSenderId: 789, currentUserId: 101, isSenderCurrentUser: false}
➕ Adding new message from others
```

Nếu vẫn không hoạt động, hãy copy toàn bộ console logs để debug tiếp.
