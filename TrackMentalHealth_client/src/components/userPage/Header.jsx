import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from '../../api/userAPI';
import { useEffect } from "react";
import { logout } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router";
import imgLogo from '@assets/images/logos/logoTMH.png';
import '@assets/css/Logo.css'; // Assuming you have a CSS file for header styles
const Header = () => {
  const userRole = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.user);
  console.log(userInfo);
  const userID = userInfo.userId;
  const [user, setUser] = useState({});
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
            <li><a href="#hero" className="active">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Diary</a></li>
            <li><a href="#portfolio">Mood</a></li>
            <li><a href="#pricing">Blog</a></li>
            <li><a href="#team">Lesson</a></li>
            <li><a href="#team">Community Social</a></li>
            <li><a href="#team"> Mental Tests</a></li>
            <li><a href="#contact">Contact</a></li>
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
