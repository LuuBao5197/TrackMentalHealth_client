import React from 'react';
import { 
  BsBell, BsGear, BsWindow, BsHeadset, 
  BsTwitterX, BsFacebook, BsInstagram, BsLinkedin 
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
                  <span className="badge-text me-3">Innovative Solutions</span>
                </div>
              </div>

              <h1 className="hero-title mb-4">
                Accelerating business growth through innovative technology
              </h1>

              <p className="hero-description mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et.
              </p>

              <div className="cta-wrapper">
                <a href="#" className="btn btn-primary">Discover More</a>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-image">
                <img
                  src={illustration}
                  alt="Business Growth"
                  className="img-fluid"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Feature Boxes */}
          <div className="row feature-boxes">
            <FeatureBox icon={<BsGear />} title="Rapid Deployment" text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis." delay="200" />
            <FeatureBox icon={<BsWindow />} title="Advanced Security" text="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." delay="300" />
            <FeatureBox icon={<BsHeadset />} title="Dedicated Support" text="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." delay="400" />
          </div>
        </div>
      </section>

    </>
  );
};

const FeatureBox = ({ icon, title, text, delay }) => (
  <div className="col-lg-4 mb-4 mb-lg-0" data-aos="fade-up" data-aos-delay={delay}>
    <div className="feature-box d-flex">
      <div className="feature-icon me-sm-4 mb-3 mb-sm-0 fs-3">{icon}</div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-text">{text}</p>
      </div>
    </div>
  </div>
);

export default HeroPage;
