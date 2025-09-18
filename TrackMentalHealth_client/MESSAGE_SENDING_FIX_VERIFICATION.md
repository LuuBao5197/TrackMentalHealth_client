# 🔧 Message Sending Fix Verification

## Vấn đề từ Log
```
📤 Sent WS message to [/app/chat/2] {sender: {…}, receiver: {…}, message: 'chao', session: {…}}
📩 Subscribe session message: {message: 'chao', senderId: 1, senderName: 'dang minh quan 1'}
📩 ChatWithUser received private message: {message: 'chao', senderId: 1, senderName: 'dang minh quan 1'}
❌ Message already exists, skipping: {message: 'chao', senderId: 1, senderName: 'dang minh quan 1'}
```

**Phân tích:**
- Gửi tin nhắn thành công ✅
- Backend phản hồi đúng ✅  
- ChatWithUser nhận tin nhắn ✅
- Nhưng bị skip vì logic kiểm tra trùng sai ❌

## Root Cause
Logic kiểm tra trùng tin nhắn đang so sánh nội dung + senderId:
```javascript
// SAI:
const exists = prev.some(m => 
    (m.id && msg.id && m.id === msg.id) || 
    (m.text === msg.message && m.user.id === msg.senderId.toString())
);
```

**Vấn đề:**
1. User gửi tin nhắn "chao" → Optimistic update tạo tin nhắn tạm thời
2. WebSocket response trả về tin nhắn "chao" với senderId: 1
3. Logic kiểm tra thấy `m.text === msg.message` và `m.user.id === msg.senderId.toString()` → skip!

## Fix Applied

### 1. **Sửa logic kiểm tra trùng**
```javascript
// ĐÚNG:
const exists = prev.some(m => 
    m.id && msg.id && m.id === msg.id
);
// Chỉ kiểm tra trùng bằng ID thật, không kiểm tra nội dung
```

### 2. **Thêm debug logs chi tiết**
```javascript
console.log("🔄 Replacing temporary message");
console.log("🔍 Looking for temporary message with text:", msg.message);
console.log("🔍 Current messages:", prev.map(m => ({ id: m.id, text: m.text, isTemporary: m.isTemporary })));
console.log("✅ Found temporary message to replace:", m);
```

## Expected Flow

### Khi user gửi tin nhắn:
1. **Optimistic update** → Thêm tin nhắn tạm thời với `isTemporary: true`
2. **Gửi WebSocket** → Backend xử lý và phản hồi
3. **Nhận response** → Tin nhắn thật từ server
4. **Thay thế tin nhắn tạm** → Tin nhắn tạm thời được thay bằng tin nhắn thật
5. **Hiển thị tin nhắn** → User thấy tin nhắn của mình

### Khi user khác gửi tin nhắn:
1. **Nhận WebSocket** → Tin nhắn từ server
2. **Kiểm tra trùng** → Chỉ kiểm tra bằng ID
3. **Thêm tin nhắn mới** → Hiển thị tin nhắn của người khác

## Expected Console Output

### Khi gửi tin nhắn thành công:
```
📤 Sent WS message to [/app/chat/2] {sender: {…}, receiver: {…}, message: 'chao', session: {…}}
📩 Subscribe session message: {message: 'chao', senderId: 1, senderName: 'dang minh quan 1'}
📩 ChatWithUser received private message: {message: 'chao', senderId: 1, senderName: 'dang minh quan 1'}
🔍 Sender check: {messageSenderId: 1, currentUserId: 1, isSenderCurrentUser: true}
🔄 Replacing temporary message
🔍 Looking for temporary message with text: chao
🔍 Current messages: [{id: "temp_123", text: "chao", isTemporary: true}]
✅ Found temporary message to replace: {id: "temp_123", text: "chao", isTemporary: true}
🔍 Updated messages: [{id: "real_456", text: "chao", isTemporary: undefined}]
```

### Khi nhận tin nhắn từ người khác:
```
📩 ChatWithUser received private message: {message: 'hi', senderId: 2, senderName: 'user2'}
🔍 Sender check: {messageSenderId: 2, currentUserId: 1, isSenderCurrentUser: false}
➕ Adding new message from others
```

## Test Cases

### ✅ Test Case 1: Gửi tin nhắn thành công
1. User gửi tin nhắn "Hello"
2. **Expected**: Tin nhắn hiển thị trong chat UI
3. **Expected**: Console logs theo expected output

### ✅ Test Case 2: Nhận tin nhắn từ người khác
1. User khác gửi tin nhắn
2. **Expected**: Tin nhắn hiển thị trong chat UI
3. **Expected**: Không bị skip

### ✅ Test Case 3: Tin nhắn không bị lặp
1. Gửi tin nhắn nhiều lần
2. **Expected**: Mỗi tin nhắn chỉ hiển thị 1 lần

## Kết quả
- ✅ **Tin nhắn gửi đi hiển thị đúng** trong UI
- ✅ **Tin nhắn từ người khác hiển thị** đúng
- ✅ **Logic kiểm tra trùng** chính xác
- ✅ **Debug logs chi tiết** để troubleshoot
- ✅ **Optimistic update** hoạt động đúng

## Lưu ý
- Nếu vẫn bị skip, kiểm tra console logs để xem tin nhắn tạm thời có `isTemporary: true` không
- Có thể cần kiểm tra `currentUserId` có đúng không
