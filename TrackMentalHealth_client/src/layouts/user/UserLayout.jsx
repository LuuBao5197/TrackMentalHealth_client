import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import Header from '@components/userPage/Header';
import Footer from '@components/userPage/Footer';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/main.css';

// Custom hooks
import useBodyScrolled from '../../hooks/useBodyScrolled';
import useMobileNavToggle from '../../hooks/useMobileNavToggle';
import useScrollTopButton from '../../hooks/useScrollTopButton';
import useAOS from '../../hooks/useAOS';
import usePreloader from '../../hooks/usePreloader';

// WebSocket
import { connectWebSocket } from '../../services/stompClient';

const UserLayout = () => {
  const userRole = useSelector((state) => state.auth.user);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Set userId vào localStorage khi login
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('currentUserId', userRole.userId);
      console.log(userRole);
      
    }
  }, [userRole]);

  // Thêm class vào body
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

  // Init effects
  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  // WebSocket connect
  useEffect(() => {
    if (!userRole) return;

    const onPrivateMessage = (msg) => {
      console.log("[WebSocket] Tin nhắn riêng:", msg);
      // TODO: Xử lý hiển thị hoặc cập nhật state nếu cần
    };

    const onGroupMessage = (msg) => {
      console.log("[WebSocket] Tin nhắn nhóm:", msg);
      // TODO: Xử lý hiển thị hoặc cập nhật state nếu cần
    };

    const onNotification = (noti) => {
      console.log("[WebSocket] Thông báo:", noti);
      toast.info(`Notification: ${noti.title || noti.message || ''}`);
    };

    const onCallSignal = (signal) => {
      console.log("[WebSocket] Tín hiệu cuộc gọi:", signal);
      if (signal.type === "CALL_REQUEST" && signal.calleeId === userRole.userId) {
        toast.info(`${signal.callerName} is calling you...`, {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          // bạn có thể thêm nút chấp nhận/từ chối trong toast nếu muốn
        });
      }
    };

    const disconnect = connectWebSocket({
      sessionId: null,
      groupId: null,
      callId: `user_${userRole.userId}`,
      onPrivateMessage,
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
  }, [userRole]);

  return (
    <div>
      <Header />

      <main style={{ paddingTop: headerHeight }} className="container">
        <Outlet />
        <button onClick={() => toast.success("Test toast")}>Test Toast</button>
      </main>

      <Footer />

      {/* 🔔 Global toast notification */}
       <ToastContainer
        position="top-right"
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
  );
};

export default UserLayout;
