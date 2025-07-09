import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ExerciseManager = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9999/api/exercise/')
      .then(response => setExercises(response.data))
      .catch(error => console.error('Lỗi khi tải danh sách bài tập:', error));
  }, []);

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Danh sách bài tập</h2>
        <p>Thực hành và nâng cao kỹ năng qua các bài tập</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
          {exercises.length === 0 ? (
            <p>Đang tải dữ liệu hoặc không có bài tập nào.</p>
          ) : (
            exercises.map(ex => {
              const imageUrl = ex.mediaUrl?.startsWith('http')
                ? ex.mediaUrl
                : 'assets/img/default-exercise.webp';

              return (
                <div
                  key={ex.id}
                  className="col-lg-6 col-md-6 portfolio-item isotope-item filter-exercise"
                >
                  <div className="portfolio-card">
                    <div className="portfolio-image">
                      <img
                        src={imageUrl}
                        className="img-fluid"
                        alt={ex.title}
                        loading="lazy"
                      />
                      <div className="portfolio-overlay">
                        <div className="portfolio-actions">
                          <Link to={`/auth/exercise/${ex.id}`} className="details-link">
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-content">
                      <span className="category">{ex.mediaType}</span>
                      <h3>{ex.title}</h3>
                      <p>{ex.instruction?.substring(0, 100)}...</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default ExerciseManager;
