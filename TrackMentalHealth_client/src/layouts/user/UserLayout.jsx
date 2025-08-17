import React, { useEffect, useState, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import Header from '@components/userPage/Header';
import Footer from '@components/userPage/Footer';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/main.css';

import useBodyScrolled from '../../hooks/useBodyScrolled';
import useMobileNavToggle from '../../hooks/useMobileNavToggle';
import useScrollTopButton from '../../hooks/useScrollTopButton';
import useAOS from '../../hooks/useAOS';
import usePreloader from '../../hooks/usePreloader';

import { connectWebSocket } from '../../services/StompClient';
import ToastTypes, { showToast } from '../../utils/showToast';

// Tạo context để truyền WebSocket dữ liệu xuống con (ví dụ ChatWithUser)
export const WebSocketContext = createContext();

const UserLayout = () => {
  const userRole = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  const [headerHeight, setHeaderHeight] = useState(0);

  // Giữ trạng thái tin nhắn, thông báo, cuộc gọi để truyền xuống con nếu cần
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [incomingCallSignal, setIncomingCallSignal] = useState(null);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('currentUserId', userRole.userId);
      console.log(userRole);
    }
  }, [userRole]);

  useEffect(() => {
    document.body.classList.add('index-page');
    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
    return () => {
      document.body.classList.remove('index-page');
    };
  }, []);

  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  // WebSocket connect và lắng nghe các sự kiện
  useEffect(() => {
    if (!userRole) return;

    const onPrivateMessage = (msg) => {
      console.log("[WebSocket] Tin nhắn riêng:", msg);
      setPrivateMessages(prev => [...prev, msg]);
      // Bạn có thể show toast nếu muốn
    };

    const onGroupMessage = (msg) => {
      console.log("[WebSocket] Tin nhắn nhóm:", msg);
      setGroupMessages(prev => [...prev, msg]);
    };

    const onNotification = (noti) => {
      console.log("[WebSocket] Thông báo:", noti);
      setNotifications(prev => [...prev, noti]);
      toast.info(`Notification: ${noti.title || noti.message || ''}`);
    };

    const onCallSignal = (signal) => {
      console.log("Tín hiệu cuộc gọi:", signal);
      if (signal.type === "CALL_REQUEST" && signal.calleeId === userRole.userId) {
        setIncomingCallSignal(signal);
        showToast({
          message: `${signal.callerName} is calling you...`,
          type: ToastTypes.INFO,
          time: 15000,
          showCallButtons: true,
          onAccept: () => {
            setIncomingCallSignal(null);
            navigate(`/user/video-call/${signal.sessionId || signal.callId}`);
          },
          onCancel: () => {
            setIncomingCallSignal(null);
            // Gửi signal hủy call nếu cần
          }
        });
      }
    };

    const disconnect = connectWebSocket({
      sessionId: null,
      groupId: null,
      callId: `user_${userRole.userId}`,
      onPrivateMessage, // global toast
      onGroupMessage,
      onNotification,
      onCallSignal,
    });


    return () => {
      if (disconnect) {
        console.log("[WebSocket] Ngắt kết nối");
        disconnect();
      }
    };
  }, [userRole, navigate]);

  return (
    <WebSocketContext.Provider value={{
      privateMessages,
      groupMessages,
      notifications,
      incomingCallSignal,
      setIncomingCallSignal,
    }}>
      <div>
        <Header />
        <main style={{ paddingTop: headerHeight }} className="container">

          {/* <button onClick={() => toast.success("Test toast")}>
            Test Toast
          </button> */}

          <Outlet />
          <button
            onClick={() => navigate('/user/chat/ai')}
            className="chat-ai-button glow btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              width: "64px",
              height: "64px",
              fontSize: "28px",
              zIndex: 1050,
              transition: "all 0.2s ease-in-out",
              backgroundColor: "#119658ff", // màu cyan

            }}
            title="Trò chuyện với AI"
            aria-label="Trò chuyện với AI"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 0 0-2 2v20l4-4h14a2 2 0 0 0 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </button>
        </main>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </WebSocketContext.Provider>
  );
};

export default UserLayout;
