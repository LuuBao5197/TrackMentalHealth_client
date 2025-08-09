import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import Header from '@components/userPage/Header';
import Footer from '@components/userPage/Footer';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../assets/css/main.css';

// Custom hooks
import useBodyScrolled from '../../hooks/useBodyScrolled';
import useMobileNavToggle from '../../hooks/useMobileNavToggle';
import useScrollTopButton from '../../hooks/useScrollTopButton';
import useAOS from '../../hooks/useAOS';
import usePreloader from '../../hooks/usePreloader';
import CallSignalListener from '../../components/chatPage/chatvideo/CallSignalListener';


const UserLayout = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const userRole = useSelector((state) => state.auth.user);

  useEffect(() => {
    document.body.classList.add('index-page');

    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    if (userRole) {
      localStorage.setItem('currentUserId', userRole.userId);
    }

    return () => {
      document.body.classList.remove('index-page');
    };
  }, [userRole]);

  // Init effects
  useBodyScrolled();
  useMobileNavToggle();
  useScrollTopButton();
  useAOS();
  usePreloader();

  return (
    <div>
      <Header />

      {/* 📞 WebSocket call signal listener chạy nền */}
      <CallSignalListener />

      <main style={{ paddingTop: headerHeight }} className="container">
        <Outlet />
      </main>

      <Footer />

      {/* 🔔 Global toast notification */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default UserLayout;
