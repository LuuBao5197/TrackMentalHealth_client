# 🌐 WebSocket Network Setup Guide

## Vấn đề
WebSocket hoạt động bình thường trên máy bạn nhưng máy khác không sử dụng được.

## Root Causes

### **1. WebSocket URL cố định:**
```javascript
// Vấn đề cũ:
webSocketFactory: () => new WebSocket("/ws")
```
- **Máy bạn**: `http://localhost:5173/ws` → proxy đến `http://localhost:9999` ✅
- **Máy khác**: `http://[IP_MÁY_BẠN]:5173/ws` → proxy đến `http://localhost:9999` ❌

### **2. Vite proxy chỉ hoạt động local:**
```javascript
// vite.config.js
server: {
  proxy: {
    '/ws': {
      target: 'http://localhost:9999', // ❌ Chỉ localhost
    }
  }
}
```

## Fixes Applied

### **1. Dynamic WebSocket URL:**
```javascript
// StompClient.jsx
webSocketFactory: () => {
    const wsUrl = import.meta.env.DEV 
        ? "/ws"  // Development: use proxy
        : `ws://${window.location.hostname}:9999/ws`; // Production: direct connection
    
    console.log("🔌 WebSocket URL:", wsUrl);
    return new WebSocket(wsUrl);
}
```

### **2. Allow External Connections:**
```javascript
// vite.config.js
server: {
  host: '0.0.0.0', // Allow external connections
  port: 5173,
  proxy: {
    '/ws': {
      target: 'http://localhost:9999',
      changeOrigin: true,
      ws: true, 
    },
  }
}
```

## Setup Instructions

### **Cho máy chủ (máy bạn):**

#### **1. Chạy Backend:**
```bash
# Terminal 1: Backend
cd backend
java -jar your-backend.jar
# Backend chạy trên port 9999
```

#### **2. Chạy Frontend:**
```bash
# Terminal 2: Frontend
cd TrackMentalHealth_client
npm run dev
# Frontend chạy trên port 5173
```

#### **3. Kiểm tra IP:**
```bash
# Windows
ipconfig
# Tìm IPv4 Address (ví dụ: 192.168.1.100)

# Mac/Linux
ifconfig
# Tìm inet (ví dụ: 192.168.1.100)
```

### **Cho máy khách (máy khác):**

#### **1. Truy cập qua IP:**
```
http://192.168.1.100:5173
```

#### **2. Kiểm tra Console:**
- Mở Developer Tools (F12)
- Xem Console tab
- Phải thấy: `🔌 WebSocket URL: ws://192.168.1.100:9999/ws`
- Phải thấy: `✅ WebSocket connected`

## Expected Console Output

### **Máy chủ (localhost):**
```
🔌 WebSocket URL: /ws
✅ WebSocket connected
```

### **Máy khách (IP access):**
```
🔌 WebSocket URL: ws://192.168.1.100:9999/ws
✅ WebSocket connected
```

## Troubleshooting

### **Nếu máy khách không kết nối được:**

#### **1. Kiểm tra Firewall:**
```bash
# Windows: Mở Windows Defender Firewall
# Cho phép Java (port 9999) và Node.js (port 5173)

# Mac: System Preferences > Security & Privacy > Firewall
# Cho phép Java và Node.js
```

#### **2. Kiểm tra Network:**
```bash
# Từ máy khách, ping máy chủ:
ping 192.168.1.100

# Kiểm tra port 9999:
telnet 192.168.1.100 9999
```

#### **3. Kiểm tra Backend:**
```bash
# Backend phải bind tất cả interfaces:
# Không phải: server.port=9999
# Mà phải: server.address=0.0.0.0 server.port=9999
```

#### **4. Kiểm tra Console:**
- Có thấy `🔌 WebSocket URL:` không?
- URL có đúng IP không?
- Có lỗi WebSocket không?

### **Nếu vẫn không được:**

#### **Option 1: Sử dụng ngrok (temporary)**
```bash
# Cài ngrok
npm install -g ngrok

# Expose backend
ngrok http 9999
# Sẽ có URL: https://abc123.ngrok.io

# Sửa StompClient.jsx:
const wsUrl = `wss://abc123.ngrok.io/ws`;
```

#### **Option 2: Deploy lên server**
- Deploy backend lên server (Heroku, AWS, etc.)
- Deploy frontend lên Netlify, Vercel, etc.
- Sử dụng HTTPS/WSS

## Production Setup

### **1. Environment Variables:**
```javascript
// .env.production
VITE_WS_URL=wss://your-backend-domain.com/ws
VITE_API_BASE_URL=https://your-backend-domain.com
```

### **2. Update StompClient:**
```javascript
const wsUrl = import.meta.env.VITE_WS_URL || 
    (import.meta.env.DEV ? "/ws" : `ws://${window.location.hostname}:9999/ws`);
```

## Kết quả
- ✅ **WebSocket hoạt động trên tất cả máy** trong cùng mạng
- ✅ **Dynamic URL** dựa trên environment
- ✅ **External connections** được hỗ trợ
- ✅ **Debug logs** để troubleshoot
- ✅ **Production ready** setup
