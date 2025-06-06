import React from 'react';

const CallToAction2 = () => {
  return (
    <section id="call-to-action-2" className="call-to-action-2 section light-background">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
            <div className="cta-image-wrapper">
              <img
                src="assets/img/cta/cta-4.webp"
                alt="Call to Action"
                className="img-fluid rounded-4"
              />
              <div className="cta-pattern"></div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
            <div className="cta-content">
              <h2>Transform Your Vision Into Reality Today</h2>
              <p className="lead">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
                ullamcorper mattis, pulvinar dapibus leo.
              </p>

              <div className="cta-features">
                <div className="feature-item" data-aos="zoom-in" data-aos-delay="400">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Lorem ipsum dolor sit amet consectetur</span>
                </div>
                <div className="feature-item" data-aos="zoom-in" data-aos-delay="450">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Praesent eget risus vitae massa</span>
                </div>
                <div className="feature-item" data-aos="zoom-in" data-aos-delay="500">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Aenean pretium nisi vel pulvinar</span>
                </div>
              </div>

              <div className="cta-action mt-5">
                <a href="#" className="btn btn-primary btn-lg me-3">
                  Get Started
                </a>
                <a href="#" className="btn btn-outline-primary btn-lg">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction2;
