import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '@assets/images/logos/logoTMH.png'; // Đường dẫn logo
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{ backgroundColor: '#da9090ff' }}
    >
      <img
        src={logo}
        alt="Website Logo"
        style={{ width: '150px', marginBottom: '30px' }}
      />

      <div
        className="p-5 rounded shadow text-center"
        style={{
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          color: '#333',
        }}
      >
        <h2 className="text-danger mb-3">Access Denied</h2>
        <p className="text-muted fs-5">
          You are not authorized to view this page.
        </p>
        <Link to="/user/homepage" className="btn btn-outline-primary mt-3 px-4">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
