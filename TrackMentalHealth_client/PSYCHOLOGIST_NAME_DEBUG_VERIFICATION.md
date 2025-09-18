# 🔧 Psychologist Name Debug Verification

## Vấn đề đã sửa
**Vấn đề**: Khi mới nhắn tin với psychologist, tên hiển thị bị sai.

## Root Cause Analysis
Có thể có vấn đề với:
1. **Cấu trúc dữ liệu psychologist** không đúng
2. **Logic lấy tên** từ `psychologist?.usersID?.fullname` sai
3. **Receiver data** không được truyền đúng cách

## Debug Solution Applied

### 1. **Thêm debug logs trong `chatWithPsychologist`**
```javascript
// ChatPage.jsx
const chatWithPsychologist = async (psychologistId) => {
  try {
    const data = await initiateChatSession(psychologistId, currentUserId);
    if (data.id) {
      // Tìm psychologist info từ danh sách
      const psychologist = psychologists.find(p => p.id === psychologistId);
      console.log("🔍 Psychologist data:", psychologist);
      
      const receiverData = {
        id: psychologist?.usersID?.id || psychologistId,
        fullname: psychologist?.usersID?.fullname || psychologist?.fullname || "Psychologist",
        avatar: psychologist?.usersID?.avatar || psychologist?.avatar
      };
      
      console.log("🔍 Receiver data:", receiverData);
      
      navigate(`/user/chat/${data.id}`, { 
        state: { receiver: receiverData } 
      });
    }
  } catch (err) {
    showAlert("Error fetching chat session.", "error");
  }
};
```

### 2. **Thêm debug logs trong `ChatWithUser`**
```javascript
// ChatWithUser.jsx
const preloadedReceiver = location.state?.receiver;
console.log("🔍 Preloaded receiver:", preloadedReceiver);

const [receiverId, setReceiverId] = useState(preloadedReceiver?.id || null);
const [receiverName, setReceiverName] = useState(preloadedReceiver?.fullname || "Đối phương");
const [receiverAvatar, setReceiverAvatar] = useState(
  preloadedReceiver?.avatar?.trim()
    ? preloadedReceiver.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(preloadedReceiver?.fullname || "U")}`
);

console.log("🔍 Initial receiver state:", { receiverId, receiverName, receiverAvatar });
```

## Expected Console Output

### Khi click "Chat with Psychologist":
```
🔍 Psychologist data: {
  id: 1,
  usersID: {
    id: 123,
    fullname: "Dr. John Smith",
    avatar: "avatar_url"
  },
  // ... other fields
}
🔍 Receiver data: {
  id: 123,
  fullname: "Dr. John Smith",
  avatar: "avatar_url"
}
```

### Khi vào ChatWithUser:
```
🔍 Preloaded receiver: {
  id: 123,
  fullname: "Dr. John Smith",
  avatar: "avatar_url"
}
🔍 Initial receiver state: {
  receiverId: 123,
  receiverName: "Dr. John Smith",
  receiverAvatar: "avatar_url"
}
```

## Possible Issues to Check

### ❌ Issue 1: Psychologist data structure
**Nếu log hiển thị:**
```
🔍 Psychologist data: undefined
```
**Giải pháp**: Kiểm tra `psychologists` array có data không

### ❌ Issue 2: Wrong field access
**Nếu log hiển thị:**
```
🔍 Psychologist data: { id: 1, fullname: "Dr. John", ... }
```
**Nhưng không có `usersID`**
**Giải pháp**: Sửa logic lấy tên từ `psychologist.fullname` thay vì `psychologist.usersID.fullname`

### ❌ Issue 3: Receiver data not passed
**Nếu log hiển thị:**
```
🔍 Preloaded receiver: undefined
```
**Giải pháp**: Kiểm tra navigation có truyền state đúng không

## Test Steps

### ✅ Test Case 1: Check psychologist data structure
1. Mở Developer Console
2. Click "Chat with Psychologist"
3. **Expected**: Log hiển thị psychologist data đầy đủ

### ✅ Test Case 2: Check receiver data
1. Vào chat với psychologist
2. **Expected**: Log hiển thị receiver data đúng

### ✅ Test Case 3: Check name display
1. Vào chat với psychologist
2. **Expected**: Tên hiển thị đúng trong header

## Next Steps

1. **Chạy test** và xem console logs
2. **Xác định vấn đề** dựa trên logs
3. **Sửa logic** lấy tên dựa trên cấu trúc dữ liệu thực tế
4. **Remove debug logs** sau khi sửa xong

## Kết quả
- ✅ **Debug logs** để xác định vấn đề
- ✅ **Console output** chi tiết để troubleshoot
- ✅ **Step-by-step** để fix vấn đề tên sai
