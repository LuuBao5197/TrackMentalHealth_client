import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LessonManager = () => {
  const [lessons, setLessons] = useState([]);
  const [activeFilter, setActiveFilter] = useState('*');

  useEffect(() => {
    axios.get('http://localhost:9999/api/lessons')
      .then(response => setLessons(response.data))
      .catch(error => console.error('Lỗi khi tải danh sách bài học:', error));
  }, []);

  const getLessonCategoryClass = (lesson) => {
    return `filter-${lesson.category?.toLowerCase() || 'general'}`;
  };

  const filteredLessons = lessons.filter(lesson => {
    if (activeFilter === '*') return true;
    return getLessonCategoryClass(lesson) === activeFilter;
  });

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Danh sách bài học</h2>
        <p>Khám phá các bài học hấp dẫn và thực hành kỹ năng của bạn</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order">

          {/* Danh sách bài học */}
          <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
            {filteredLessons.map((lesson) => {
              const imageUrl = lesson.photo
              ? `http://localhost:9999/uploads/${lesson.photo}`
              : 'assets/img/default-lesson.webp';
            
              console.log('Image URL:', imageUrl); // 👈 Kiểm tra URL hiển thị
            
              return (
                <div
                  key={lesson.id}
                  className={`col-lg-6 col-md-6 portfolio-item isotope-item ${getLessonCategoryClass(lesson)}`}
                >
                  <div className="portfolio-card">
                    <div className="portfolio-image">
                      <img
                        src={imageUrl}
                        className="img-fluid"
                        alt={lesson.title}
                        loading="lazy"
                      />
                      <div className="portfolio-overlay">
                        <div className="portfolio-actions">
                          <Link
                            to={`/user/lesson/${lesson.id}`}
                            className="details-link"
                          >
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-content">
                      <span className="category">{lesson.category}</span>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description?.substring(0, 100)}...</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonManager;
