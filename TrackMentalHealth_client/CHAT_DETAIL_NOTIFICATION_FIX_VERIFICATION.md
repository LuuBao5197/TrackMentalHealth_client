# 🔧 Chat Detail Notification Fix Verification

## Vấn đề đã sửa
**Vấn đề**: Khi user đang ở trong Chat Detail (đang chat với ai đó), vẫn nhận được toast thông báo tin nhắn mới, gây khó chịu vì user đã đang xem tin nhắn rồi.

## Root Cause
Các callback `onNewMessage`, `onPrivateMessage`, và `onGroupMessage` trong `UserLayout.jsx` chỉ kiểm tra tin nhắn có phải từ chính mình hay không, nhưng không kiểm tra user có đang ở trong chat detail hay không.

## Solution Applied

### 1. **Thêm useLocation để detect route hiện tại**
```javascript
import { Outlet, useLocation } from "react-router-dom";

const UserLayout = () => {
  const location = useLocation(); // ✅ để detect route hiện tại
  // ...
};
```

### 2. **Tạo function kiểm tra user có đang ở trong chat detail**
```javascript
// ✅ Function để kiểm tra user có đang ở trong chat detail không
const isInChatDetail = () => {
  const path = location.pathname;
  return path.includes('/chat/') && (path.includes('/user/') || path.includes('/group/'));
};
```

### 3. **Sửa logic thông báo cho tất cả callback**
```javascript
// onNewMessage
if (msg.senderId && msg.senderId != user?.id && !isInChatDetail()) {
  showToast(`New message from ${msg.senderName}`, "info");
} else {
  console.log("🔇 Skipping notification:", {
    isOwnMessage: msg.senderId == user?.id,
    isInChatDetail: isInChatDetail()
  });
}

// onPrivateMessage
if (msg.senderId && msg.senderId != user?.id && !isInChatDetail()) {
  showToast(`📩 New message from ${msg.senderName}`, "info");
} else {
  console.log("🔇 Skipping notification for private message:", {
    isOwnMessage: msg.senderId == user?.id,
    isInChatDetail: isInChatDetail()
  });
}

// onGroupMessage
if (msg.senderId && msg.senderId != user?.id && !isInChatDetail()) {
  showToast(`📩 New group message from ${msg.senderName || 'Someone'}`, "info");
} else {
  console.log("🔇 Skipping notification for group message:", {
    isOwnMessage: msg.senderId == user?.id,
    isInChatDetail: isInChatDetail()
  });
}
```

## Expected Behavior

### ✅ Khi user đang ở trong Chat Detail:
1. **Tin nhắn vẫn hiển thị trong UI** (vì vẫn cập nhật state)
2. **Không có toast thông báo** (vì đã skip khi `isInChatDetail() = true`)
3. **Console log**: `🔇 Skipping notification: { isOwnMessage: false, isInChatDetail: true }`

### ✅ Khi user ở ngoài Chat Detail:
1. **Tin nhắn hiển thị trong UI**
2. **Có toast thông báo** (vì `isInChatDetail() = false`)
3. **Console log**: `📩 New message from [senderName]`

## Route Detection Logic

### ✅ Routes được detect là "Chat Detail":
- `/user/chat/user/[sessionId]` - Chat với user khác
- `/user/chat/group/[groupId]` - Chat group
- Bất kỳ route nào chứa `/chat/` và có `/user/` hoặc `/group/`

### ✅ Routes KHÔNG được detect là "Chat Detail":
- `/user/chat` - Trang danh sách chat
- `/user/dashboard` - Dashboard
- `/user/profile` - Profile
- Các trang khác

## Test Cases

### ✅ Test Case 1: Đang ở trong chat private
1. Mở chat với user khác: `/user/chat/user/123`
2. User khác gửi tin nhắn
3. **Expected**: Không có toast, tin nhắn vẫn hiển thị trong UI

### ✅ Test Case 2: Đang ở trong chat group
1. Mở chat group: `/user/chat/group/456`
2. User khác gửi tin nhắn trong group
3. **Expected**: Không có toast, tin nhắn vẫn hiển thị trong UI

### ✅ Test Case 3: Ở ngoài chat detail
1. Ở trang danh sách chat: `/user/chat`
2. User khác gửi tin nhắn
3. **Expected**: Có toast thông báo

### ✅ Test Case 4: Ở trang khác
1. Ở dashboard: `/user/dashboard`
2. User khác gửi tin nhắn
3. **Expected**: Có toast thông báo

## Console Output

### Khi đang ở trong chat detail:
```
📩 UserLayout received private message: {senderId: 2, message: "Hi", ...}
🔇 Skipping notification for private message: {
  isOwnMessage: false,
  isInChatDetail: true
}
```

### Khi ở ngoài chat detail:
```
📩 UserLayout received private message: {senderId: 2, message: "Hi", ...}
📩 New message from John Doe
```

## Kết quả
- ✅ **Không còn toast spam** khi đang ở trong chat detail
- ✅ **Vẫn nhận thông báo** khi ở ngoài chat detail
- ✅ **UX tốt hơn** - không gây khó chịu khi đang chat
- ✅ **Tin nhắn vẫn hiển thị** trong UI (chỉ tắt toast)
- ✅ **Debug logs chi tiết** để troubleshoot

## Lưu ý
- Logic detection dựa trên URL path
- Có thể cần cập nhật nếu có thêm route chat mới
- State vẫn được cập nhật để tin nhắn hiển thị trong UI
- Chỉ tắt toast notification, không ảnh hưởng đến chức năng chat
