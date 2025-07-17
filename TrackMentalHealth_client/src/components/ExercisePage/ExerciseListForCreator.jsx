import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const ExerciseListForCreator = () => {
  const [exercises, setExercises] = useState([]);
  const [activeFilter, setActiveFilter] = useState('*');
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6;

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.contentCreatorId;
      } catch (error) {
        console.error('Token không hợp lệ:', error);
        return;
      }
    }

    if (!userId) {
      console.error('Không tìm thấy contentCreatorId trong token.');
      return;
    }

    axios.get(`http://localhost:9999/api/exercise/creator/${userId}`)
      .then(response => setExercises(response.data))
      .catch(error => console.error('Lỗi khi tải danh sách bài tập:', error));
  }, []);

  const getExerciseCategoryClass = (exercise) => {
    return `filter-${exercise.mediaType?.toLowerCase() || 'general'}`;
  };

  const filteredExercises = exercises.filter((exercise) => {
    if (activeFilter === '*') return true;
    return getExerciseCategoryClass(exercise) === activeFilter;
  });

  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  const startIndex = (currentPage - 1) * exercisesPerPage;
  const currentExercises = filteredExercises.slice(startIndex, startIndex + exercisesPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
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

        .edit-icon-link {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #6f42c1;
          color: white;
          border-radius: 50%;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.3s;
          font-size: 16px;
          z-index: 10;
        }

        .edit-icon-link:hover {
          background-color: #5a32a3;
          color: #fff;
        }
      `}</style>

      <section id="portfolio" className="portfolio section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Danh sách bài tập</h2>
          <p>Khám phá các bài tập bạn đã tạo</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
            {currentExercises.length === 0 ? (
              <p>Không có bài tập nào.</p>
            ) : (
              currentExercises.map((exercise) => {
                const imageUrl = exercise.mediaUrl?.startsWith('http')
                  ? exercise.mediaUrl
                  : 'assets/img/default-exercise.webp';

                return (
                  <div
                    key={exercise.id}
                    className={`col-lg-6 col-md-6 portfolio-item isotope-item ${getExerciseCategoryClass(exercise)}`}
                  >
                    <div className="portfolio-card position-relative">
                      <div className="portfolio-image">
                        <img
                          src={imageUrl}
                          className="img-fluid"
                          alt={exercise.title}
                          loading="lazy"
                        />
                        <div className="portfolio-overlay">
                          <div className="portfolio-actions">
                            <Link to={`/auth/exercise/${exercise.id}`} className="details-link">
                              <i className="bi bi-arrow-right"></i>
                            </Link>

                            {/* Link chỉnh sửa bài học */}
                            <Link
                              to={`/auth/exercise/edit/${exercise.id}`}
                              state={{ exercise }}
                              className="details-link"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="portfolio-content">
                        <span className="category">{exercise.mediaType}</span>
                        <h3>{exercise.title}</h3>
                        <p>{exercise.instruction?.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-custom mt-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <button className="page-label btn btn-dark" disabled>
                Trang {currentPage} / {totalPages}
              </button>
              {currentPage > 1 && (
                <button className="btn btn-dark" onClick={() => goToPage(1)}>
                  Trang đầu
                </button>
              )}
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index + 1)}
                  className={`btn ${currentPage === index + 1 ? 'btn-danger' : 'btn-dark'}`}
                >
                  {index + 1}
                </button>
              ))}
              {currentPage < totalPages && (
                <button className="btn btn-dark" onClick={() => goToPage(totalPages)}>
                  Trang cuối
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ExerciseListForCreator;
