import React, { useEffect, useState, createContext } from "react";
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

import { connectWebSocket } from "../../services/stompClient";
import { showToast } from "../../utils/showToast";
import { chatAI, getAIHistory } from "../../api/api";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import ChatWidgetWrapper from "../../components/chatPage/ChatWidgetWrapper";

export const WebSocketContext = createContext();
export const ChatContext = createContext();

const UserLayout = () => {
  const user = useSelector((state) => state.auth.user);

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

  // kết nối WebSocket (chỉ giữ noti + call)
  useEffect(() => {
    if (!user) return;

    const disconnect = connectWebSocket({
      callId: `user_${user.userId}`,
      onNotification: (noti) => {
        setNotifications((prev) => [...prev, noti]);
        showToast(`${noti.message}`);
      },
      onCallSignal: (signal) => {
        setIncomingCallSignal(signal);
        if (signal.type === "CALL_REQUEST" && signal.calleeId === user.userId) {
          showToast({
            message: `${signal.callerName} is calling you...`,
            type: ToastTypes.INFO,
            time: 15000,
            showCallButtons: true,
            position: "top-center",
            onAccept: () => {
              setIncomingCallSignal(null);
              window.location.href = `/user/video-call/${signal.sessionId || signal.callId
                }`;
            },
            onCancel: () => setIncomingCallSignal(null),
          });
        }
      },
    });

    return () => disconnect && disconnect();
  }, [user]);

  // load lịch sử chat bot
  const loadAIHistory = async () => {
    try {
      const history = await getAIHistory(currentUserId);
      console.log(history);
      
      // Convert dữ liệu từ backend thành format chatMessages
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

  // chỉ chạy 1 lần khi mount
  useEffect(() => {
    if (!aiHistoryLoaded) {
      loadAIHistory();
    }
  }, []);



  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;

    const userMsg = { senderId: currentUserId, message: msg };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const aiReply = await chatAI({
        message: msg,
        userId: currentUserId.toString(),
      });
      setChatMessages((prev) => [
        ...prev,
        { senderId: "ai", message: String(aiReply) },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { senderId: "ai", message: "Xin lỗi, tôi chưa thể trả lời." },
      ]);
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
          <main style={{ paddingTop: headerHeight }} className="container">
            <Outlet />
            {showChatWidget && aiHistoryLoaded && (
              <ChatWidgetWrapper
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}


          </main>
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            newestOnTop
            theme="colored"
          />
        </div>
      </ChatContext.Provider>
    </WebSocketContext.Provider>
  );
};

export default UserLayout;
