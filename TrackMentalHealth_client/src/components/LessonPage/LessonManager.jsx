import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const userId = 1; // ✅ Bạn có thể lấy userId từ context/login nếu cần

const LessonManager = () => {
  const [lessons, setLessons] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;

  useEffect(() => {
    // Load bài học
    axios.get('http://localhost:9999/api/lesson')
      .then(res => {
        setLessons(res.data);

        // Với mỗi lesson, gọi API để lấy phần trăm tiến trình
        res.data.forEach(lesson => {
          axios
            .get(`http://localhost:9999/api/user/${userId}/lesson/${lesson.id}/progress-percent`)
            .then(p => {
              const rounded = Math.round(p.data); // 🔵 Làm tròn phần trăm
              setProgressMap(prev => ({ ...prev, [lesson.id]: rounded }));
            })
            .catch(err => {
              console.error(`Lỗi tải tiến trình cho bài học ${lesson.id}:`, err);
            });
        });
      })
      .catch(err => {
        console.error('Lỗi khi tải bài học:', err);
      });
  }, []);

  const totalPages = Math.ceil(lessons.length / lessonsPerPage);
  const currentLessons = lessons.slice((currentPage - 1) * lessonsPerPage, currentPage * lessonsPerPage);

  const CircularProgress = ({ percentage }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle className="bg-circle" cx="40" cy="40" r={radius} />
          <circle
            className="progress-circle"
            cx="40"
            cy="40"
            r={radius}
            style={{ strokeDasharray: circumference, strokeDashoffset }}
          />
        </svg>
        <div className="percentage">{percentage}%</div>
        <style>{`
          .circular-progress {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .circular-progress svg {
            transform: rotate(-90deg);
            width: 100%;
            height: 100%;
          }
          .circular-progress circle {
            fill: transparent;
            stroke-width: 6;
            stroke-linecap: round;
          }
          .bg-circle {
            stroke: #e0e0e0;
          }
          .progress-circle {
            stroke: #007bff;
            transition: stroke-dashoffset 0.3s;
          }
          .percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
        `}</style>
      </div>
    );
  };

  return (
    <section className="section">
      <div className="container section-title">
        <h2>Danh sách bài học</h2>
        <p>Khám phá các bài học hấp dẫn và thực hành kỹ năng của bạn</p>
      </div>

      <div className="container">
        <div className="row g-4">
          {currentLessons.map((lesson) => {
            const progress = progressMap[lesson.id] ?? 0;
            const imageUrl = lesson.photo?.startsWith('http')
              ? lesson.photo
              : 'assets/img/default-lesson.webp';

            return (
              <div key={lesson.id} className="col-lg-6 col-md-6">
                <div className="portfolio-card position-relative">
                  <div className="portfolio-image">
                    <img
                      src={imageUrl}
                      className="img-fluid"
                      alt={lesson.title}
                      loading="lazy"
                    />
                    <div className="portfolio-overlay">
                      <div className="portfolio-actions">
                        <Link to={`/auth/lesson/${lesson.id}`} className="details-link">
                          <i className="bi bi-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="portfolio-content" style={{ paddingRight: 90 }}>
                    <h3>{lesson.title?.length > 40 ? lesson.title.slice(0, 40) + '...' : lesson.title}</h3>
                    <p>{lesson.description?.length > 50 ? lesson.description.slice(0, 50) + '...' : lesson.description}</p>
                    <div className="progress-container position-absolute bottom-0 end-0 m-3">
                      <CircularProgress percentage={progress} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-custom mt-4 d-flex justify-content-center gap-2 flex-wrap">
            <button className="btn btn-dark" disabled>Trang {currentPage} / {totalPages}</button>
            {currentPage > 1 && (
              <button className="btn btn-dark" onClick={() => setCurrentPage(1)}>Trang đầu</button>
            )}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn ${currentPage === i + 1 ? 'btn-danger' : 'btn-dark'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button className="btn btn-dark" onClick={() => setCurrentPage(totalPages)}>Trang cuối</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LessonManager;
