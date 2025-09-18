# 🔧 Psychologist Name Fix Verification

## Vấn đề
Tên chuyên gia là "V.A" nhưng khi bấm vào chat thì hiển thị "Psychologist".

## Root Cause

### **Logic xử lý receiver info bị sai:**
```javascript
// Vấn đề cũ:
if (!receiverId && res.length > 0) {
    // Chỉ cập nhật khi receiverId chưa có
    // Nhưng receiverId đã được set từ preloadedReceiver?.id
    // Nên không bao giờ vào block này
}
```

### **Flow hiện tại:**
1. **ChatPage.jsx** truyền `receiver: { fullname: "V.A", ... }`
2. **ChatWithUser.jsx** nhận preloaded receiver và set initial state
3. **fetchMessages()** chạy nhưng không cập nhật receiver info vì `receiverId` đã có
4. **Kết quả**: Hiển thị tên mặc định "Psychologist" thay vì "V.A"

## Fix Applied

### **1. Luôn cập nhật từ session data:**
```javascript
// Fix mới:
if (res.length > 0) {
    const { sender, receiver } = res[0].session;
    const otherUser = sender.id === currentUserId ? receiver : sender;
    
    // Luôn cập nhật thông tin từ session data để đảm bảo chính xác
    setReceiverId(otherUser.id);
    setReceiverName(otherUser.fullname || "Đối phương");
    setReceiverAvatar(otherUser.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullname || "U")}`);
}
```

### **2. Fallback cho preloaded data:**
```javascript
else if (!receiverId) {
    // Nếu chưa có tin nhắn và chưa có receiverId, sử dụng preloaded data
    console.log("🔍 No messages found, using preloaded receiver data:", preloadedReceiver);
}
```

### **3. Debug logs chi tiết:**
```javascript
console.log("🔍 Preloaded receiver:", preloadedReceiver);
console.log("🔍 Initial receiver state:", { receiverId, receiverName, receiverAvatar });
console.log("🔍 Updated receiver info from session data:", {
    id: otherUser.id,
    fullname: otherUser.fullname,
    avatar: otherUser.avatar
});
```

## Expected Flow

### **Khi bấm chat với psychologist:**
1. **ChatPage.jsx** gọi `chatWithPsychologist(psychologistId)`
2. **Tạo session** và lấy psychologist info
3. **Navigate** với `state: { receiver: { fullname: "V.A", ... } }`
4. **ChatWithUser.jsx** nhận preloaded receiver
5. **fetchMessages()** chạy và cập nhật receiver info từ session data
6. **Hiển thị** tên chính xác "V.A"

### **Console Output Expected:**
```
🔍 Preloaded receiver: {id: 123, fullname: "V.A", avatar: "..."}
🔍 Initial receiver state: {receiverId: 123, receiverName: "V.A", receiverAvatar: "..."}
🔍 Updated receiver info from session data: {id: 123, fullname: "V.A", avatar: "..."}
```

## Test Cases

### ✅ Test Case 1: Chat với psychologist có tên "V.A"
1. Bấm chat với psychologist có tên "V.A"
2. **Expected**: Header hiển thị "V.A" thay vì "Psychologist"

### ✅ Test Case 2: Chat với psychologist có tên khác
1. Bấm chat với psychologist có tên "Dr. Smith"
2. **Expected**: Header hiển thị "Dr. Smith"

### ✅ Test Case 3: Chat với user thường
1. Bấm chat với user thường
2. **Expected**: Header hiển thị tên user chính xác

### ✅ Test Case 4: Chat mới (chưa có tin nhắn)
1. Tạo chat session mới
2. **Expected**: Sử dụng preloaded data nếu có

## Debug Steps

### 1. Kiểm tra Preloaded Receiver
```javascript
// Console should show:
🔍 Preloaded receiver: {id: 123, fullname: "V.A", avatar: "..."}
```

### 2. Kiểm tra Initial State
```javascript
// Console should show:
🔍 Initial receiver state: {receiverId: 123, receiverName: "V.A", receiverAvatar: "..."}
```

### 3. Kiểm tra Session Data Update
```javascript
// Console should show:
🔍 Updated receiver info from session data: {id: 123, fullname: "V.A", avatar: "..."}
```

### 4. Kiểm tra UI Display
- Header phải hiển thị tên chính xác "V.A"
- Avatar phải hiển thị đúng

## Troubleshooting

### Nếu vẫn hiển thị "Psychologist":

1. **Kiểm tra Preloaded Receiver**
   - Có thấy `🔍 Preloaded receiver:` không?
   - `fullname` có đúng "V.A" không?

2. **Kiểm tra Session Data**
   - Có thấy `🔍 Updated receiver info from session data:` không?
   - `fullname` trong session data có đúng không?

3. **Kiểm tra ChatPage.jsx**
   - Function `chatWithPsychologist` có truyền đúng data không?
   - `receiverData.fullname` có đúng không?

4. **Kiểm tra Backend**
   - API `initiateChatSession` có trả về đúng psychologist info không?
   - Session data có chứa đúng thông tin không?

## Kết quả
- ✅ **Tên psychologist hiển thị chính xác** "V.A" thay vì "Psychologist"
- ✅ **Session data được ưu tiên** hơn preloaded data
- ✅ **Fallback mechanism** cho trường hợp chưa có tin nhắn
- ✅ **Debug logs chi tiết** để troubleshoot
- ✅ **Consistent behavior** cho tất cả loại chat
