import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserInfo } from "../../api/userAPI";
import { getNotificationsByUserId, deleteNotificationById, changeStatusNotification, hasUnreadMessages } from "../../api/api";
import { logout } from "../../redux/slices/authSlice";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { connectWebSocket } from "../../services/StompClient";
import { toast, ToastContainer } from "react-toastify";
import NotificationDropdown from "../notification/NotificationDropdown";
import imgLogo from "@assets/images/logos/logoTMH.png";
import NotificationDetailModal from "../../utils/Modals/NotificationDetailModal";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const userInfo = useSelector((state) => state.auth.user);
  const userID = userInfo?.userId;
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [hasUnreadChat, setHasUnreadChat] = useState(false); // state mới

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


  // Check unread chat khi load trang
  useEffect(() => {
    if (!currentUserId) return;
    const checkUnread = async () => {
      try {
        const result = await hasUnreadMessages(currentUserId);
        setHasUnreadChat(result);
      } catch (err) {
        console.error("Lỗi check unread chat:", err);
      }
    };
    checkUnread();
  }, [currentUserId]);

  // Mark notification as read
  const handleOpenNotificationDetail = async (noti) => {
    setSelectedNotification(noti);
    setShowDetailModal(true);

    if (!noti.read) {
      await changeStatusNotification(noti.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
      );
      setUnreadNotifications((prev) =>
        prev.filter((n) => n.id !== noti.id)
      );
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
            <li><Link to="/user/write-diary" className={currentPath === "/user/write-diary" ? "active" : ""}>Diary</Link></li>
            <li><Link to="/user/lesson" className={currentPath === "/user/lesson" ? "active" : ""}>Lesson</Link></li>
            <li><Link to="/user/artical" className={currentPath === "/user/artical" ? "active" : ""}>Article</Link></li>
            <li><Link to="/user/exercise" className={currentPath === "/user/exercise" ? "active" : ""}>Exercise</Link></li>
            <li><Link to="/user/social" className={currentPath === "/user/social" ? "active" : ""}>Community Social</Link></li>
            <li><Link to="/user/tests" className={currentPath === "/user/tests" ? "active" : ""}>Mental Tests</Link></li>
            <li><Link to="/user/quizs" className={currentPath === "/user/quizs" ? "active" : ""}>Quiz</Link></li>

            <li>
              <Link
                to="/user/chat/list"
                className={`position-relative ${currentPath === "/user/chat/list" ? "active" : ""}`}
              >
                Chat
                {hasUnreadChat && <span className="red-dot"></span>}
              </Link>
            </li>
            {/* <li><Link to="/user/f" className={currentPath === "/user/f" ? "active" : ""}>Contact</Link></li> */}
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        {/* Notification + User menu */}
        {userInfo ? (
          <div className="d-flex align-items-center gap-3">
            <NotificationDropdown
              notifications={notifications}
              unreadNotifications={unreadNotifications}
              handleOpenNotificationDetail={handleOpenNotificationDetail}
              handleDeleteNotification={handleDeleteNotification}
            />
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

                <li>
                  <button className="dropdown-item" onClick={() => navigate(`/user/quiz/history`

                  )}>
                    View Quiz History
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => navigate(`/user/test/history`

                  )}>
                    View Test History
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
      <NotificationDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        notification={selectedNotification}
      />
    </header>
  );
};

export default Header;
