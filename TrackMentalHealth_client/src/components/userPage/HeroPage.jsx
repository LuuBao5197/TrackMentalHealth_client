import React from 'react';
import { Link } from 'react-router-dom';

import {
  BsPen, BsClockHistory, BsPencilSquare,
  BsBell
} from 'react-icons/bs';
import illustration from '@assets/img/illustration/illustration-16.webp';

const HeroPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="hero section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center mb-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="badge-wrapper mb-3">
                <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
                  <div className="icon-circle me-2"><BsBell /></div>
                  <span className="badge-text me-3">Emotional Journal</span>
                </div>
              </div>

              <h1 className="hero-title mb-4">
                Ghi lại cảm xúc mỗi ngày – hiểu chính mình rõ hơn
              </h1>

              <p className="hero-description mb-4">
                Viết nhật ký cảm xúc, xem lại hành trình tâm trạng và nhận gợi ý cải thiện tinh thần cá nhân.
              </p>

              <div className="cta-wrapper">
                <Link to="/write-diary" className="btn btn-primary">Bắt đầu ghi nhật ký</Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-image">
                <img
                  src={illustration}
                  alt="Emotional Growth"
                  className="img-fluid"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Feature Boxes */}
          <div className="row feature-boxes">
            <FeatureBox
              icon={<BsPen />}
              title="Ghi nhật ký"
              text="Bắt đầu ghi"
              delay="200"
              link="/user/write-diary"
            />
            <FeatureBox
              icon={<BsClockHistory />}
              title="Xem lại lịch sử"
              text="Xem lại các nhật ký trước đây, theo dõi cảm xúc theo thời gian một cách trực quan."
              delay="300"
              link="/user/history"  
            />
            <FeatureBox
              icon={<BsPencilSquare />}
              title="Cập nhật nhật ký"
              text="Chỉnh sửa nội dung nhật ký nếu bạn muốn bổ sung hay thay đổi suy nghĩ."
              delay="400"
               link="/user/edit-diary"
            />
          </div>
        </div>
      </section>
    </>
  );
};

// Feature Box Component with Link
const FeatureBox = ({ icon, title, text, delay, link }) => (
  <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay={delay}>
    <Link to={link || "#"} className="text-decoration-none text-dark">
      <div className="feature-box d-flex">
        <div className="feature-icon me-sm-4 mb-3 mb-sm-0 fs-3">{icon}</div>
        <div className="feature-content">
          <h3 className="feature-title">{title}</h3>
          <p className="feature-text">{text}</p>
        </div>
      </div>
    </Link>
  </div>
);

export default HeroPage;
