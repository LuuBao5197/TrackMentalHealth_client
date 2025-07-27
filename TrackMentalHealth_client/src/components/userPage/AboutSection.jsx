import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@assets/css/about.css'; // File CSS tùy chỉnh
import { ReactComponent as AboutSVG } from '@assets/img/about/AboutUsTMH.svg';
import { Link } from 'react-router-dom';
const AboutSection = () => {
  return (
    <section
      id="about"
      className="about section py-5"
      style={{ backgroundColor: '#f9f9f9' }}
    >
      <div className="container">
        <div className="row gy-4 align-items-center">

          {/* Nội dung giới thiệu */}
          <div className="col-lg-6 content" data-aos="fade-up" data-aos-delay="100">
            <p className="text-primary fw-semibold">About TrackMentalHealth</p>
            <h3 className="mb-4">Empowering Mental Wellness Through Technology</h3>
            <p className="text-muted">
              TrackMentalHealth is a modern platform designed to help individuals monitor, assess,
              and improve their mental well-being. Our mission is to make mental health support
              more accessible, personalized, and data-driven.
            </p>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                <span>Daily mood and symptom tracking with visual insights</span>
              </li>
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                <span>Access to self-assessment tests such as PHQ-9 and MBTI</span>
              </li>
              <li className="mb-2">
                <i className="bi bi-check-circle text-success me-2"></i>
                <span>Expert content and guidance from psychologists and mental health professionals</span>
              </li>
            </ul>
            <Link to="/user/homepage" className="btn btn-outline-primary mt-3">

              <i className="bi bi-arrow-right ms-1"></i>Learn More
            </Link>

          </div>

          {/* Hình ảnh minh họa */}
          <div className="col-lg-6 about-images d-flex justify-content-center" data-aos="fade-up" data-aos-delay="200">
            <AboutSVG style={{ width: '100%', height: 'auto' }} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
