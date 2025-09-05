import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const LessonManager = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.user);
  const userId = userInfo?.userId || null;

  const [lessons, setLessons] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;

  useEffect(() => {
    axios.get('http://localhost:9999/api/lesson')
      .then(res => {
        const activeLessons = res.data.filter(
          lesson => lesson.status === true || lesson.status === 'true'
        );
        setLessons(activeLessons);

        activeLessons.forEach(lesson => {
          if (userId) {
            axios
              .get(`http://localhost:9999/api/user/${userId}/lesson/${lesson.id}/progress-percent`)
              .then(p => {
                const rounded = Math.round(p.data);
                setProgressMap(prev => ({ ...prev, [lesson.id]: rounded }));
              })
              .catch(err => {
                console.error(`Failed to load progress for lesson ${lesson.id}:`, err);
              });
          } else {
            setProgressMap(prev => ({ ...prev, [lesson.id]: 0 }));
          }
        });
      })
      .catch(err => {
        console.error('Failed to load lessons:', err);
      });
  }, [userId]);

  const handleLessonClick = (lessonId) => {
    if (!userId) {
      Swal.fire({
        title: 'You are not logged in',
        text: 'You need to log in to access this lesson. Would you like to log in now?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Log in',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/auth/login');
        }
      });
    }
  };

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
      </div>
    );
  };

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>List of Lessons</h2>
        <p>Explore engaging lessons and practice your skills</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="300">
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
                        {userId ? (
                          <Link to={`/user/lesson/${lesson.id}`} className="details-link">
                            <div className="arrow-circle">
                              <i className="bi bi-arrow-right"></i>
                            </div>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleLessonClick(lesson.id)}
                            className="details-link btn btn-link p-0 border-0"
                          >
                            <div className="arrow-circle">
                              <i className="bi bi-arrow-right"></i>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="portfolio-content" style={{ paddingRight: 90 }}>
                    {/* Category hiển thị giống mediaType của Exercise */}
                    {lesson.category && (
                      <span className="category">
                        {lesson.category.name || lesson.category}
                      </span>
                    )}

                    <h3>
                      {lesson.title?.length > 40
                        ? lesson.title.slice(0, 40) + '...'
                        : lesson.title}
                    </h3>

                    <p>
                      {lesson.description?.length > 50
                        ? lesson.description.slice(0, 50) + '...'
                        : lesson.description}
                    </p>
                    <div className="progress-container position-absolute bottom-0 end-0 m-3">
                      <CircularProgress percentage={progress} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination-custom mt-4 d-flex justify-content-center gap-2 flex-wrap">
            <button className="btn btn-dark" disabled>Page {currentPage} / {totalPages}</button>
            {currentPage > 1 && (
              <button className="btn btn-dark" onClick={() => setCurrentPage(1)}>First</button>
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
              <button className="btn btn-dark" onClick={() => setCurrentPage(totalPages)}>Last</button>
            )}
          </div>
        )}
      </div>

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
        .arrow-circle {
          background-color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .arrow-circle i {
          color: #6c63ff;
          font-size: 20px;
        }
        .arrow-circle:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .details-link {
          text-decoration: none;
        }
      `}</style>
    </section>
  );
};

export default LessonManager;
