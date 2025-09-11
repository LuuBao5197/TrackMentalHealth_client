// userLayout.jsx
import React, { useEffect, useState, createContext, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Header from "@components/userPage/Header";
import Footer from "@components/userPage/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/css/main.css";
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

  const [headerHeight, setHeaderHeight] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [incomingCallSignal, setIncomingCallSignal] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [showChatWidget, setShowChatWidget] = useState(true);
  const [aiHistoryLoaded, setAiHistoryLoaded] = useState(false);

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
        showToast(`New message from ${msg.senderName}`, "info");
      },
      onPrivateMessage: (msg) => {
        if (!msg?.message || !msg.senderName) return;
        showToast(`📩 New message from ${msg.senderName}`, "info");
      },


      onCallSignal: (signal) => {
        // Nếu là CALL_REQUEST thì lưu state để CallSignalListener xử lý
        if (signal.type === "CALL_REQUEST" && signal.calleeId === user.userId) {
          setIncomingCallSignal(signal);
        }

        // Nếu các loại tín hiệu khác (accepted, rejected, ended) cũng truyền vào state
        if (["CALL_ACCEPTED", "CALL_REJECTED", "CALL_ENDED"].includes(signal.type)) {
          setIncomingCallSignal(signal);
        }
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
    <WebSocketContext.Provider value={{ notifications, incomingCallSignal }}>
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
