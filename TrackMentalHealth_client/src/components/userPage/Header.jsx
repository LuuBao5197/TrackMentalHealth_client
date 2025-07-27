import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from '../../api/userAPI';
import { useEffect } from "react";
import { logout } from "../../redux/slices/authSlice";
import { useLocation, useNavigate } from "react-router";
import imgLogo from '@assets/images/logos/logoTMH.png';
import '@assets/css/Logo.css'; // Assuming you have a CSS file for header styles
import { Link } from "react-router-dom";
const Header = () => {
  const userRole = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.user);
  console.log(userInfo);
  const userID = userInfo.userId;
  const [user, setUser] = useState({});
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    fetchData(userID);
  }, [])
  const fetchData = async (userID) => {
    try {
      const res = await getUserInfo(userID);
      console.log(res.data);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  const handleEditProfile = () => {
    console.log("User object:", userRole);
    if (userRole && userRole.userId) {
      navigate(`/user/edit-profile/${userRole.userId}`);
    } else {
      alert("User ID not found in localStorage");
    }
  };

  const handleLogout = () => {
    // Xử lý logout
    console.log("User logged out");
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container position-relative d-flex align-items-center justify-content-between">

        <a href="/" className="logo-wrapper">
          <h1 className="sitename">
            <img src={imgLogo} alt="Logo" className="logo-img" />
          </h1>
        </a>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/user/homepage" className={currentPath === "/user/homepage" ? "active" : ""}>HomePage</Link></li>
            <li><Link to="/user/aboutUs" className={currentPath === "/user/aboutUs" ? "active" : ""}>About</Link></li>
            <li><Link to="/user/write-diary" className={currentPath === "/user/write-diary" ? "active" : ""}>Diary</Link></li>
            <li><Link to="/user/b" className={currentPath === "/user/b" ? "active" : ""}>Blog</Link></li>
            <li><Link to="/user/c"  className={currentPath === "/user/c" ? "active" : ""}>Lesson</Link></li>
            <li><Link to="/user/d"  className={currentPath === "/user/d" ? "active" : ""}>Community Social</Link></li>
            <li><Link to="/user/e"  className={currentPath === "/user/e" ? "active" : ""}>Mental Tests</Link></li>
            <li><Link to="/user/f"  className={currentPath === "/user/f" ? "active" : ""}>Contact</Link></li>
          </ul>
          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>
        {/* User Info or Login Button */}
        {user ? (
          <div className="dropdown btn-getstarted">
            <a
              href="#"
              className="d-flex align-items-center text-decoration-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={user.avatar}
                alt="Hi Avatar"
                width="70"
                height="70"
                className="rounded-circle me-2"
              />
              {/* <span className="d-none d-md-inline">{user.fullname}</span> */}
              {/* <i className="bi bi-chevron-down ms-1"></i> */}
            </a>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li><button className="dropdown-item" onClick={handleEditProfile}>Edit Profile</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <a className="btn btn-primary ms-3 btn-getstarted" href="/login">
            <i className="bi bi-person-circle me-1"></i> Login
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
