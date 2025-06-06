import React from 'react';

const portfolioItems = [
  {
    id: 1,
    categoryClass: 'filter-web',
    category: 'Web Design',
    title: 'Modern Dashboard Interface',
    description: 'Maecenas faucibus mollis interdum sed posuere consectetur est at lobortis.',
    imgSrc: 'assets/img/portfolio/portfolio-1.webp',
    gallery: 'portfolio-gallery-web',
  },
  {
    id: 2,
    categoryClass: 'filter-graphics',
    category: 'Graphics',
    title: 'Creative Brand Identity',
    description: 'Vestibulum id ligula porta felis euismod semper at vulputate.',
    imgSrc: 'assets/img/portfolio/portfolio-10.webp',
    gallery: 'portfolio-gallery-graphics',
  },
  {
    id: 3,
    categoryClass: 'filter-motion',
    category: 'Motion',
    title: 'Product Animation Reel',
    description: 'Donec ullamcorper nulla non metus auctor fringilla dapibus.',
    imgSrc: 'assets/img/portfolio/portfolio-7.webp',
    gallery: 'portfolio-gallery-motion',
  },
  {
    id: 4,
    categoryClass: 'filter-brand',
    category: 'Branding',
    title: 'Luxury Brand Package',
    description: 'Aenean lacinia bibendum nulla sed consectetur elit.',
    imgSrc: 'assets/img/portfolio/portfolio-4.webp',
    gallery: 'portfolio-gallery-brand',
  },
  {
    id: 5,
    categoryClass: 'filter-web',
    category: 'Web Design',
    title: 'E-commerce Platform',
    description: 'Nullam id dolor id nibh ultricies vehicula ut id elit.',
    imgSrc: 'assets/img/portfolio/portfolio-2.webp',
    gallery: 'portfolio-gallery-web',
  },
  {
    id: 6,
    categoryClass: 'filter-graphics',
    category: 'Graphics',
    title: 'Digital Art Collection',
    description: 'Cras mattis consectetur purus sit amet fermentum.',
    imgSrc: 'assets/img/portfolio/portfolio-11.webp',
    gallery: 'portfolio-gallery-graphics',
  },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="portfolio section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Portfolio</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div
          className="isotope-layout"
          data-default-filter="*"
          data-layout="masonry"
          data-sort="original-order"
        >
          <div className="portfolio-filters-container" data-aos="fade-up" data-aos-delay="200">
            <ul className="portfolio-filters isotope-filters">
              <li data-filter="*" className="filter-active">
                All Work
              </li>
              <li data-filter=".filter-web">Web Design</li>
              <li data-filter=".filter-graphics">Graphics</li>
              <li data-filter=".filter-motion">Motion</li>
              <li data-filter=".filter-brand">Branding</li>
            </ul>
          </div>

          <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className={`col-lg-6 col-md-6 portfolio-item isotope-item ${item.categoryClass}`}
              >
                <div className="portfolio-card">
                  <div className="portfolio-image">
                    <img
                      src={item.imgSrc}
                      className="img-fluid"
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="portfolio-overlay">
                      <div className="portfolio-actions">
                        <a
                          href={item.imgSrc}
                          className="glightbox preview-link"
                          data-gallery={item.gallery}
                        >
                          <i className="bi bi-eye"></i>
                        </a>
                        <a href="portfolio-details.html" className="details-link">
                          <i className="bi bi-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="portfolio-content">
                    <span className="category">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
