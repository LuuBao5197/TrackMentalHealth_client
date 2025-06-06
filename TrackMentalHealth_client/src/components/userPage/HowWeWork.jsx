import React from 'react';

const HowWeWork = () => {
  return (
    <section id="how-we-work" className="how-we-work section">

      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>How We Work</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">

        <div className="steps-5">
          <div className="process-container">

            <div className="process-item" data-aos="fade-up" data-aos-delay="200">
              <div className="content">
                <span className="step-number">01</span>
                <div className="card-body">
                  <div className="step-icon">
                    <i className="bi bi-pencil-square"></i>
                  </div>
                  <div className="step-content">
                    <h3>Project Planning</h3>
                    <p>Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-item" data-aos="fade-up" data-aos-delay="300">
              <div className="content">
                <span className="step-number">02</span>
                <div className="card-body">
                  <div className="step-icon">
                    <i className="bi bi-gear"></i>
                  </div>
                  <div className="step-content">
                    <h3>Development Phase</h3>
                    <p>Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-item" data-aos="fade-up" data-aos-delay="400">
              <div className="content">
                <span className="step-number">03</span>
                <div className="card-body">
                  <div className="step-icon">
                    <i className="bi bi-search"></i>
                  </div>
                  <div className="step-content">
                    <h3>Testing &amp; QA</h3>
                    <p>Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="process-item" data-aos="fade-up" data-aos-delay="500">
              <div className="content">
                <span className="step-number">04</span>
                <div className="card-body">
                  <div className="step-icon">
                    <i className="bi bi-rocket-takeoff"></i>
                  </div>
                  <div className="step-content">
                    <h3>Launch &amp; Support</h3>
                    <p>Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default HowWeWork;
