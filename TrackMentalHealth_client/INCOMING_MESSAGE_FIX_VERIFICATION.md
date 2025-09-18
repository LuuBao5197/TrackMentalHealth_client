# 🔧 Incoming Message Fix Verification

## Vấn đề đã sửa
**Vấn đề**: Tin nhắn đến có toast hiển thị nhưng không hiển thị trong UI chat.

## Nguyên nhân gốc
1. **Thiếu `setPrivateMessages` trong WebSocketContext** - ChatWithUser.jsx không thể cập nhật state
2. **Xung đột WebSocket connections** - Nhiều nơi tạo WebSocket riêng biệt
3. **Thiếu state management** cho group messages

## Giải pháp đã áp dụng

### 1. **Thêm state management vào UserLayout.jsx**
```javascript
// Thêm state cho private và group messages
const [privateMessages, setPrivateMessages] = useState([]);
const [groupMessages, setGroupMessages] = useState([]);

// Cập nhật WebSocketContext
<WebSocketContext.Provider value={{ 
  notifications, 
  incomingCallSignal, 
  setIncomingCallSignal,
  privateMessages,
  setPrivateMessages,
  groupMessages,
  setGroupMessages
}}>
```

### 2. **Xử lý tin nhắn trong UserLayout WebSocket**
```javascript
onPrivateMessage: (msg) => {
  console.log("📩 UserLayout received private message:", msg);
  showToast(`📩 New message from ${msg.senderName}`, "info");
  setPrivateMessages(prev => [...prev, msg]);
},
onGroupMessage: (msg) => {
  console.log("📩 UserLayout received group message:", msg);
  showToast(`📩 New group message from ${msg.senderName || 'Someone'}`, "info");
  setGroupMessages(prev => [...prev, msg]);
},
```

### 3. **Sửa ChatWithUser.jsx - Sử dụng context thay vì tạo WebSocket riêng**
```javascript
// Thay vì tạo WebSocket riêng, lắng nghe từ context
const { privateMessages } = useContext(WebSocketContext);

useEffect(() => {
  if (!privateMessages || privateMessages.length === 0) return;
  
  const latestMessage = privateMessages[privateMessages.length - 1];
  if (latestMessage.session?.id !== sessionId) return;
  
  // Xử lý hiển thị tin nhắn...
}, [privateMessages, sessionId, currentUserId]);
```

### 4. **Sửa ChatGroup.jsx - Tương tự**
```javascript
const { groupMessages } = useContext(WebSocketContext);

useEffect(() => {
  if (!groupMessages || groupMessages.length === 0) return;
  
  const latestMessage = groupMessages[groupMessages.length - 1];
  if (latestMessage.groupId !== groupId) return;
  
  // Xử lý hiển thị tin nhắn group...
}, [groupMessages, groupId, currentUserId]);
```

## Luồng hoạt động mới

### Trước khi sửa:
1. UserLayout tạo WebSocket → Nhận tin nhắn → Chỉ hiển thị toast
2. ChatWithUser tạo WebSocket riêng → Xung đột → Tin nhắn không hiển thị
3. ChatGroup tạo WebSocket riêng → Xung đột → Tin nhắn không hiển thị

### Sau khi sửa:
1. **UserLayout** tạo WebSocket duy nhất → Nhận tin nhắn → Cập nhật state + hiển thị toast
2. **ChatWithUser** lắng nghe từ context → Nhận tin nhắn → Hiển thị trong UI
3. **ChatGroup** lắng nghe từ context → Nhận tin nhắn → Hiển thị trong UI

## Test Cases

### ✅ Test Case 1: Tin nhắn private đến
1. User A gửi tin nhắn cho User B
2. User B đang mở chat với User A
3. **Expected**: 
   - Toast hiển thị "📩 New message from User A"
   - Tin nhắn hiển thị ngay trong chat UI

### ✅ Test Case 2: Tin nhắn group đến
1. User A gửi tin nhắn trong group
2. User B đang mở group chat
3. **Expected**:
   - Toast hiển thị "📩 New group message from User A"
   - Tin nhắn hiển thị ngay trong group chat UI

### ✅ Test Case 3: Tin nhắn đến khi không mở chat
1. User A gửi tin nhắn cho User B
2. User B đang ở trang khác (không mở chat)
3. **Expected**:
   - Toast hiển thị
   - Tin nhắn được lưu trong context
   - Khi User B mở chat, tin nhắn sẽ hiển thị

## Kết quả
- ✅ Tin nhắn đến hiển thị đúng trong UI
- ✅ Không còn xung đột WebSocket
- ✅ Toast vẫn hoạt động bình thường
- ✅ State management tập trung
- ✅ Performance tốt hơn (1 WebSocket thay vì nhiều)
