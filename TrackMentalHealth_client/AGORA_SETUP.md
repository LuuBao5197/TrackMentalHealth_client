# Agora Setup Guide

## Bước 1: Tạo Agora Account

1. Truy cập [Agora Console](https://console.agora.io/)
2. Đăng ký/Đăng nhập tài khoản
3. Tạo project mới
4. Lấy App ID từ project

## Bước 2: Cấu hình App ID

1. Mở file `src/config/agoraConfig.js`
2. Thay thế `YOUR_AGORA_APP_ID` bằng App ID thực tế:

```javascript
export const AGORA_CONFIG = {
  APP_ID: 'your-actual-app-id-here',
  // ... other config
};
```

## Bước 3: Test App ID

1. Chạy ứng dụng: `npm run dev`
2. Vào Chat → Video Call
3. Kiểm tra console để xem có lỗi không

## Bước 4: Cấu hình Token Server (Production)

Để sử dụng trong production, bạn cần:

1. Tạo token server backend
2. Cập nhật `TOKEN_SERVER_URL` trong `agoraConfig.js`
3. Implement `getAgoraToken()` function

## Troubleshooting

### Lỗi "CAN_NOT_GET_GATEWAY_SERVER"
- Kiểm tra App ID có đúng không
- Kiểm tra network connection
- Thử App ID khác

### Lỗi "Objects are not valid as a React child"
- Đã sửa trong code
- Kiểm tra showToast calls

### Video không hiển thị
- Kiểm tra camera permissions
- Kiểm tra container element
- Kiểm tra Agora logs

## Test App ID (Development)

Bạn có thể sử dụng App ID test này để test:
- App ID: `test-app-id` (chỉ để test, không hoạt động thực tế)
- Hoặc tạo App ID thực từ Agora Console
