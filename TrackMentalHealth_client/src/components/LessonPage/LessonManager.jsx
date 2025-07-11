import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LessonManager = () => {
  const [lessons, setLessons] = useState([]);
  const [activeFilter, setActiveFilter] = useState('*');
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;

  useEffect(() => {
    axios.get('http://localhost:9999/api/lessons')
      .then(response => setLessons(response.data))
      .catch(error => console.error('Lỗi khi tải danh sách bài học:', error));
  }, []);

  const getLessonCategoryClass = (lesson) => {
    return `filter-${lesson.category?.toLowerCase() || 'general'}`;
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (activeFilter === '*') return true;
    return getLessonCategoryClass(lesson) === activeFilter;
  });

  const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
  const startIndex = (currentPage - 1) * lessonsPerPage;
  const currentLessons = filteredLessons.slice(startIndex, startIndex + lessonsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      {/* Chèn CSS ngay trong file */}
      <style>{`
        .pagination-custom .btn {
          min-width: 50px;
          font-weight: 600;
          border-radius: 4px;
          padding: 8px 12px;
          transition: all 0.2s ease-in-out;
        }

        .pagination-custom .btn-danger {
          background-color: #dc3545;
          color: #fff;
        }

        .pagination-custom .btn-dark {
          background-color: #1f1f1f;
          color: #c0d3df;
          border: none;
        }

        .pagination-custom .btn:hover {
          opacity: 0.9;
        }

        .pagination-custom .page-label {
          cursor: default;
        }
      `}</style>

      <section id="portfolio" className="portfolio section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Danh sách bài học</h2>
          <p>Khám phá các bài học hấp dẫn và thực hành kỹ năng của bạn</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div
            className="isotope-layout"
            data-default-filter="*"
            data-layout="masonry"
            data-sort="original-order"
          >
            <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
              {currentLessons.map((lesson) => {
                const imageUrl = lesson.photo?.startsWith('http')
                  ? lesson.photo
                  : 'assets/img/default-lesson.webp';

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
                              to={`/auth/lesson/${lesson.id}`}
                              className="details-link"
                            >
                              <i className="bi bi-arrow-right"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio-content">
                        <h3>{lesson.title}</h3>
                        <p>{lesson.description?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phân trang giống giao diện ảnh */}
            {totalPages > 1 && (
              <div className="pagination-custom mt-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
                <button className="page-label btn btn-dark" disabled>
                  Trang {currentPage} của {totalPages}
                </button>
                {currentPage > 1 && (
                  <button
                    className="page-label btn btn-dark"
                    onClick={() => goToPage(1)}
                  >
                    Trang Đầu
                  </button>
                )}
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index + 1)}
                    className={`page-number btn ${
                      currentPage === index + 1 ? 'btn-danger' : 'btn-dark'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                {currentPage !== totalPages && (
                  <button
                    className="page-label btn btn-dark"
                    onClick={() => goToPage(totalPages)}
                  >
                    Trang Cuối
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
};

export default LessonManager;
