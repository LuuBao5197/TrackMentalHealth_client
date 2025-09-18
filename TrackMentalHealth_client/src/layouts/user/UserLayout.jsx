// userLayout.jsx
import React, { useEffect, useState, createContext, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@components/userPage/Header";
import Footer from "@components/userPage/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/css/main.css";

// Add pulse animation for WebSocket indicator
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);
import useBodyScrolled from "../../hooks/useBodyScrolled";
import useMobileNavToggle from "../../hooks/useMobileNavToggle";
import useScrollTopButton from "../../hooks/useScrollTopButton";
import useAOS from "../../hooks/useAOS";
import usePreloader from "../../hooks/usePreloader";

import { connectWebSocket, sendCallSignal } from "../../services/stompClient";
import { showToast } from "../../utils/showToast";
import { chatAI, getAIHistory } from "../../api/api";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import ChatWidgetWrapper from "../../components/chatPage/ChatWidgetWrapper";
import CallSignalListener from "../../components/chatPage/chatvideo/CallSignalListener";

export const WebSocketContext = createContext();
export const ChatContext = createContext();

const UserLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const wsConnectedRef = useRef(false); // ✅ đảm bảo connect chỉ 1 lần
  const location = useLocation(); // ✅ để detect route hiện tại

  const [headerHeight, setHeaderHeight] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [incomingCallSignal, setIncomingCallSignal] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');

  const [chatMessages, setChatMessages] = useState([]);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [aiHistoryLoaded, setAiHistoryLoaded] = useState(false);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);

  // ✅ Function để kiểm tra user có đang ở trong chat detail không
  const isInChatDetail = () => {
    const path = location.pathname;
    return path.includes('/chat/') && (path.includes('/user/') || path.includes('/group/'));
  };

  // ✅ Function để kiểm tra user có đang ở trong video call không
  const isInVideoCall = () => {
    const path = location.pathname;
    return path.includes('/video-call/');
  };

  // lưu user vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUserId", user.userId);
      localStorage.setItem("currentUserRole", user.role);
    }
  }, [user]);

  const currentUserId = getCurrentUserId();

  // setup UI hooks
  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  // lấy chiều cao header
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) setHeaderHeight(header.offsetHeight);
  }, []);

  // 🔹 Connect WebSocket chỉ 1 lần, không disconnect khi unmount
  useEffect(() => {
    if (!user || wsConnectedRef.current) return;

    wsConnectedRef.current = true;

    connectWebSocket({
      // ✅ Không dùng callId nữa
      onNotification: (noti) => {
        showToast(`${noti.message}`, "info");
        setNotifications((prev) => [...prev, noti]);
      },
      onNewMessage: (msg) => {
        console.log("📩 UserLayout received new message (no notification):", msg);
        // Không hiển thị thông báo, chỉ log để debug
      },
      onPrivateMessage: (msg) => {
        if (!msg?.message || !msg.senderName) {
          console.log("❌ Invalid private message:", msg);
          return;
        }
        console.log("📩 UserLayout received private message:", msg);
        
        // Cập nhật privateMessages state (không hiển thị thông báo)
        setPrivateMessages(prev => {
          const newMessages = [...prev, msg];
          console.log("📩 Updated privateMessages:", newMessages);
          return newMessages;
        });
      },
      onGroupMessage: (msg) => {
        if (!msg?.content) {
          console.log("❌ Invalid group message:", msg);
          return;
        }
        console.log("📩 UserLayout received group message:", msg);
        
        // Cập nhật groupMessages state (không hiển thị thông báo)
        setGroupMessages(prev => {
          const newMessages = [...prev, msg];
          console.log("📩 Updated groupMessages:", newMessages);
          return newMessages;
        });
      },


      onCallSignal: (signal) => {
        console.log("📞 UserLayout received call signal:", signal);
        
        // Nếu là CALL_REQUEST thì lưu state để CallSignalListener xử lý
        if (signal.type === "CALL_REQUEST" && signal.calleeId == user.userId) {
          console.log("📞 Incoming call for user:", user.userId);
          setIncomingCallSignal(signal);
        }

        // Nếu các loại tín hiệu khác (accepted, rejected, ended) cũng truyền vào state
        if (["CALL_ACCEPTED", "CALL_REJECTED", "CALL_ENDED", "CALL_CANCEL"].includes(signal.type)) {
          console.log("📞 Call signal update:", signal.type);
          setIncomingCallSignal(signal);
        }
      },

      onConnect: () => {
        console.log("✅ WebSocket connected in UserLayout");
        setWsStatus('connected');
      },

      onDisconnect: () => {
        console.log("❌ WebSocket disconnected in UserLayout");
        setWsStatus('disconnected');
      },

      onError: (error) => {
        console.error("💥 WebSocket error in UserLayout:", error);
        setWsStatus('error');
      }


    });
    // ⚠️ Không return disconnect, để WS luôn kết nối
  }, [user]);


  // load lịch sử chat bot
  const loadAIHistory = async () => {
    try {
      const history = await getAIHistory(currentUserId);
      const formatted = history.map((h) => ({
        id: h.id,
        senderId: String(h.role).toLowerCase() === "ai" ? "ai" : h.user?.id,
        senderName: h.role === "ai" ? "AI" : h.user?.username,
        message: h.message,
        timestamp: h.timestamp,
      }));
      setChatMessages(formatted);
      setAiHistoryLoaded(true);
    } catch (err) {
      console.error("Lỗi load history:", err);
    }
  };

  useEffect(() => {
    if (!aiHistoryLoaded) loadAIHistory();
  }, []);

  // ✅ Clear call signal khi thoát khỏi video call
  useEffect(() => {
    if (!isInVideoCall() && incomingCallSignal) {
      console.log("🔇 Clearing call signal - user left video call");
      setIncomingCallSignal(null);
    }
  }, [location.pathname, incomingCallSignal]);

  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;
    setChatMessages((prev) => [...prev, { senderId: currentUserId, message: msg }]);

    try {
      const aiReply = await chatAI({ message: msg, userId: currentUserId.toString() });
      setChatMessages((prev) => [...prev, { senderId: "ai", message: String(aiReply) }]);
    } catch {
      setChatMessages((prev) => [...prev, { senderId: "ai", message: "Xin lỗi, tôi chưa thể trả lời." }]);
    }
  };

  return (
    <WebSocketContext.Provider value={{ 
      notifications, 
      incomingCallSignal, 
      setIncomingCallSignal,
      privateMessages,
      setPrivateMessages,
      groupMessages,
      setGroupMessages
    }}>
      <ChatContext.Provider
        value={{
          chatMessages,
          setChatMessages,
          showChatWidget,
          setShowChatWidget,
          loadAIHistory,
        }}
      >
        <div>
          <Header />
          
          {/* WebSocket Status Indicator */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 9999,
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white',
            background: wsStatus === 'connected' ? '#28a745' : 
                       wsStatus === 'error' ? '#dc3545' : '#6c757d',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#fff',
              animation: wsStatus === 'connected' ? 'pulse 2s infinite' : 'none'
            }}></div>
            {wsStatus.toUpperCase()}
            {incomingCallSignal && (
              <span style={{ marginLeft: '10px', fontSize: '10px' }}>
                📞 {incomingCallSignal.type}
              </span>
            )}
          </div>
          
          {/* // UserLayout.jsx */}
          {user && (
            <CallSignalListener
              signal={incomingCallSignal}
              currentUserId={user.userId}
            />
          )}

          <main style={{ paddingTop: headerHeight }} className="container">
            <Outlet />
            {showChatWidget && aiHistoryLoaded && (
              <ChatWidgetWrapper messages={chatMessages} onSendMessage={handleSendMessage} />
            )}
          </main>
          <Footer />
          <ToastContainer position="bottom-right" autoClose={3000} newestOnTop theme="colored" />
        </div>
      </ChatContext.Provider>
    </WebSocketContext.Provider>
  );
};

export default UserLayout;
