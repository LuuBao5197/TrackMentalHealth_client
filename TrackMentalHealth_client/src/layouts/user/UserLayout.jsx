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
import { connectWebSocket } from "../../services/StompClient";
import ToastTypes, { showToast } from "../../utils/showToast";
import { chatAI, getAIHistory } from "../../api/api";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import ChatWidget from "../../components/chatPage/ChatWidget";

export const WebSocketContext = createContext();
export const ChatContext = createContext(); // Context mới để quản lý chat

const UserLayout = () => {
  const userRole = useSelector((state) => state.auth.user);
  const [headerHeight, setHeaderHeight] = useState(0);
  const currentUserId = getCurrentUserId();

  // Trạng thái WebSocket
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [incomingCallSignal, setIncomingCallSignal] = useState(null);

  // Trạng thái chat
  const [chatType, setChatType] = useState(null); // "AI", "1-1", "group"
  const [currentSession, setCurrentSession] = useState(null); // Session hoặc group
  const [chatMessages, setChatMessages] = useState([]);
  const [showChatWidget, setShowChatWidget] = useState(false);

  // Set header height
  useEffect(() => {
    document.body.classList.add("index-page");
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
    return () => {
      document.body.classList.remove("index-page");
    };
  }, []);

  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  // WebSocket
  useEffect(() => {
    if (!userRole) return;

    const disconnect = connectWebSocket({
      sessionId: null,
      groupId: null,
      callId: `user_${userRole.userId}`,
      onPrivateMessage: (msg) => {
        setPrivateMessages((prev) => [...prev, msg]);
        if (chatType === "1-1" && msg.session?.id === currentSession?.id) {
          setChatMessages((prev) => [...prev, { senderId: msg.senderId, message: msg.message }]);
        }
      },
      onGroupMessage: (msg) => {
        setGroupMessages((prev) => [...prev, msg]);
        if (chatType === "group" && msg.groupId === currentSession?.id) {
          setChatMessages((prev) => [...prev, { senderId: msg.senderId, message: msg.message }]);
        }
        toast.info("Tin nhắn nhóm mới...", { position: "top-right" });
      },
      onNotification: (noti) => {
        setNotifications((prev) => [...prev, noti]);
        toast.info(`Notification: ${noti.title || noti.message || ""}`);
      },
      onCallSignal: (signal) => {
        setIncomingCallSignal(signal);
        if (signal.type === "CALL_REQUEST" && signal.calleeId === userRole.userId) {
          showToast({
            message: `${signal.callerName} is calling you...`,
            type: ToastTypes.INFO,
            time: 15000,
            showCallButtons: true,
            position: "top-center",
            onAccept: () => {
              setIncomingCallSignal(null);
              window.location.href = `/user/video-call/${signal.sessionId || signal.callId}`;
            },
            onCancel: () => {
              setIncomingCallSignal(null);
            },
          });
        }
      },
    });

    return () => {
      if (disconnect) disconnect();
    };
  }, [userRole, chatType, currentSession]);

  // Xử lý AI chat
  const loadAIHistory = async () => {
    try {
      const history = await getAIHistory(currentUserId);
      const formattedHistory = history.map((h) => ({
        senderId: String(h.role || "user").toLowerCase() === "ai" ? "ai" : currentUserId,
        message: h.message,
      }));
      setChatMessages(formattedHistory);
      setChatType("AI");
      setCurrentSession(null);
      setShowChatWidget(true);
    } catch (err) {
      console.error("Lỗi load history:", err);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;

    if (chatType === "AI") {
      const userMessage = { senderId: currentUserId, message: msg };
      setChatMessages((prev) => [...prev, userMessage]);
      try {
        const payload = { message: msg, userId: currentUserId.toString() };
        const aiReply = await chatAI(payload);
        setChatMessages((prev) => [...prev, { senderId: "ai", message: String(aiReply) }]);
      } catch (err) {
        setChatMessages((prev) => [...prev, { senderId: "ai", message: "Xin lỗi, hiện tại tôi chưa thể trả lời." }]);
      }
    } else if (chatType === "1-1" || chatType === "group") {
      // Giả định có API gửi tin nhắn
      try {
        // await sendMessageAPI(currentSession.id, currentUserId, msg, chatType);
        setChatMessages((prev) => [...prev, { senderId: currentUserId, message: msg }]);
      } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
        toast.error("Không thể gửi tin nhắn.");
      }
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        privateMessages,
        groupMessages,
        notifications,
        incomingCallSignal,
        setIncomingCallSignal,
      }}
    >
      <ChatContext.Provider
        value={{
          chatType,
          setChatType,
          currentSession,
          setCurrentSession,
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
            {showChatWidget && (
              <ChatWidget
                title={chatType === "AI" ? "AI Psychologist" : currentSession?.name || getOtherUser(currentSession, currentUserId)?.fullname || "Chat"}
                subtitle={chatType === "AI" ? "Hỗ trợ trò chuyện" : "Online"}
                userId={currentUserId}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                greeting={
                  chatType === "AI"
                    ? "Xin chào! Tôi là AI, hôm nay bạn ổn chứ?"
                    : `Bắt đầu trò chuyện với ${currentSession?.name || getOtherUser(currentSession, currentUserId)?.fullname || "người dùng"}`
                }
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