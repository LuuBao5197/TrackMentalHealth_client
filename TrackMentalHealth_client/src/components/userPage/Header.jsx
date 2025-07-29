import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from '../../api/userAPI';
import { logout } from "../../redux/slices/authSlice";
import { useLocation, useNavigate } from "react-router";
import imgLogo from '@assets/images/logos/logoTMH.png';
import { Link } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = useSelector((state) => state.auth.user);
  const userID = userInfo?.userId; // Dùng optional chaining
  const [user, setUser] = useState(null);

  const currentPath = location.pathname;

  useEffect(() => {
    if (userID) {
      fetchData(userID);
    }
  }, [userID]);

  const fetchData = async (id) => {
    try {
      const res = await getUserInfo(id);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleEditProfile = () => {
    if (userInfo && userInfo.userId) {
      navigate(`/user/edit-profile/${userInfo.userId}`);
    } else {
      alert("User ID not found.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">

        <Link to="/" className="logo-wrapper">
          <h1 className="sitename">
            <img src={imgLogo} alt="Logo" className="logo-img" />
          </h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/user/homepage" className={currentPath === "/user/homepage" ? "active" : ""}>HomePage</Link></li>
            <li><Link to="/user/aboutUs" className={currentPath === "/user/aboutUs" ? "active" : ""}>About</Link></li>
            <li><Link to="/user/a" className={currentPath === "/user/a" ? "active" : ""}>Mood</Link></li>
            <li><Link to="/user/b" className={currentPath === "/user/b" ? "active" : ""}>Blog</Link></li>
            <li><Link to="/user/c" className={currentPath === "/user/c" ? "active" : ""}>Lesson</Link></li>
            <li><Link to="/user/social" className={currentPath === "/user/social" ? "active" : ""}>Community Social</Link></li>
            <li><Link to="/user/tests" className={currentPath === "/user/tests" ? "active" : ""}>Mental Tests</Link></li>
            <li><Link to="/user/f" className={currentPath === "/user/f" ? "active" : ""}>Contact</Link></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        {/* USER MENU */}
        {userInfo ? (
          <div className="dropdown btn-getstarted">
            <a
              href="#"
              className="d-flex align-items-center text-decoration-none p-1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ height: '50px' }}
            >
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt="User Avatar"
                className="avatar-img"
              />
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li><button className="dropdown-item" onClick={handleEditProfile}>Edit Profile</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
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
