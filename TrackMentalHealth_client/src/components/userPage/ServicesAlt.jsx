import React from 'react';

const servicesData = [
  {
    icon: 'bi bi-code-square',
    title: 'Software Engineering',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing.',
    link: 'service-details.html',
    delay: 200,
  },
  {
    icon: 'bi bi-graph-up',
    title: 'Business Analytics',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing.',
    link: 'service-details.html',
    delay: 300,
  },
  {
    icon: 'bi bi-phone',
    title: 'Mobile Solutions',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing.',
    link: 'service-details.html',
    delay: 400,
  },
  {
    icon: 'bi bi-gear',
    title: 'Tech Infrastructure',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing.',
    link: 'service-details.html',
    delay: 500,
  },
];

const ServicesAlt = () => {
  return (
    <section id="services-alt" className="services-alt section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">

        <div className="row">
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <div className="content-block">
              <h6 className="subtitle">Our innovative services</h6>
              <h2 className="title">Our customers excel in technology management</h2>
              <p className="description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tincidunt diam et gravida consequat. Sed nec mauris quis lacus commodo lobortis. Suspendisse euismod commodo sem, in finibus purus bibendum et. Morbi eu neque sed velit convallis vestibulum a vel odio.
              </p>
              <div className="button-wrapper">
                <a className="btn" href="services.html"><span>Explore All Services</span></a>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="services-list">
              {servicesData.map(({ icon, title, description, link, delay }, index) => (
                <div
                  className="service-item d-flex align-items-center"
                  data-aos="fade-up"
                  data-aos-delay={delay}
                  key={index}
                >
                  <div className="service-icon">
                    <i className={icon}></i>
                  </div>
                  <div className="service-content">
                    <h4><a href={link}>{title}</a></h4>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesAlt;
