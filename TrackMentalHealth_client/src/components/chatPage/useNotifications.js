import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserInfo } from "../../api/userAPI";
import { getNotificationsByUserId, deleteNotificationById, changeStatusNotification } from "../../api/api";
import { logout } from "../../redux/slices/authSlice";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { connectWebSocket } from "../../services/stompClient";
import { toast } from "react-toastify";
import NotificationDropdown from "../notification/NotificationDropdown";
import imgLogo from "@assets/images/logos/logoTMH.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy user info từ redux
  const userInfo = useSelector((state) => state.auth.user);
  const userID = userInfo?.userId;
  const [user, setUser] = useState(null);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  const currentUserId = parseInt(getCurrentUserId());
  const currentPath = location.pathname;

  // Fetch user info
  useEffect(() => {
    if (userID) {
      getUserInfo(userID)
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user info:", err));
    }
  }, [userID]);

  // Fetch notifications + websocket
  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByUserId(currentUserId);
        setNotifications(data);
        const unread = Array.isArray(data) ? data.filter((n) => !n.read) : [];
        setUnreadNotifications(unread);
      } catch (err) {
        console.error("❌ Lỗi khi lấy thông báo:", err);
      }
    };

    fetchNotifications();

    // WebSocket lắng nghe notification realtime
    const disconnect = connectWebSocket({
      sessionId: null,
      groupId: null,
      onNotification: (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read) {
          setUnreadNotifications((prev) => [notification, ...prev]);
        }
        toast.info(`🔔 ${notification.title}: ${notification.message}`);
      },
    });

    return () => disconnect && disconnect();
  }, [currentUserId]);

  // Mark notification as read
  const handleOpenNotificationDetail = async (noti) => {
    try {
      if (!noti.read) {
        await changeStatusNotification(noti.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
        );
        setUnreadNotifications((prev) => prev.filter((n) => n.id !== noti.id));
      }
      // Mở modal hoặc navigate nếu bạn muốn
      console.log("Open notification detail:", noti);
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotificationById(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEditProfile = () => {
    if (userInfo && userInfo.userId) {
      navigate(`/user/edit-profile/${userInfo.userId}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">
        {/* LOGO */}
        <Link to="/" className="logo-wrapper">
          <h1 className="sitename">
            <img src={imgLogo} alt="Logo" className="logo-img" />
          </h1>
        </Link>

        {/* NAV MENU */}
        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/user/homepage" className={currentPath === "/user/homepage" ? "active" : ""}>HomePage</Link></li>
            <li><Link to="/user/aboutUs" className={currentPath === "/user/aboutUs" ? "active" : ""}>About</Link></li>
            <li><Link to="/user/chat/list" className={currentPath === "/user/chat/list" ? "active" : ""}>Chat</Link></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        {/* Notification + User menu */}
        {userInfo ? (
          <div className="d-flex align-items-center gap-3">
            {/* Notification Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              unreadNotifications={unreadNotifications}
              handleOpenNotificationDetail={handleOpenNotificationDetail}
              handleDeleteNotification={handleDeleteNotification}
            />

            {/* User avatar */}
            <div className="dropdown">
              <a
                href="#"
                className="d-flex align-items-center text-decoration-none"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ width: "40px", height: "40px" }}
              >
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt="User Avatar"
                  className="rounded-circle border border-1 border-dark shadow-sm"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <button className="dropdown-item" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <Link className="btn btn-primary ms-3 text-black btn-getstarted" to="/auth/login">
            <i className="bi bi-person-circle me-1"></i> Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
