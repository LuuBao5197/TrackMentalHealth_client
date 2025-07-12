import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LessonListForCreator = () => {
  const [lessons, setLessons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 6;

  const currentUserId = localStorage.getItem('creatorId'); // hoặc dùng context/auth

  useEffect(() => {
    axios.get(`http://localhost:9999/api/lesson`)
      .then((response) => {
        // Lọc ra chỉ các bài học của Creator
        const creatorLessons = response.data.filter(
          (lesson) => lesson.creatorId === currentUserId
        );
        setLessons(creatorLessons);
      })
      .catch((error) => console.error('Lỗi khi tải danh sách bài học:', error));
  }, [currentUserId]);

  const totalPages = Math.ceil(lessons.length / lessonsPerPage);
  const startIndex = (currentPage - 1) * lessonsPerPage;
  const currentLessons = lessons.slice(startIndex, startIndex + lessonsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <style>{`
        .btn-edit {
          background-color: #007bff;
          color: #fff;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 4px;
        }
        .btn-edit:hover {
          opacity: 0.85;
        }
      `}</style>

      <section id="creator-lessons" className="portfolio section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Bài học của bạn</h2>
          <p>Quản lý và chỉnh sửa bài học bạn đã tạo</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4">
            {currentLessons.map((lesson) => {
              const imageUrl = lesson.photo?.startsWith('http')
                ? lesson.photo
                : 'assets/img/default-lesson.webp';

              return (
                <div key={lesson.id} className="col-lg-6 col-md-6 portfolio-item">
                  <div className="portfolio-card">
                    <div className="portfolio-image">
                      <img
                        src={imageUrl}
                        className="img-fluid"
                        alt={lesson.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="portfolio-content mt-2">
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description?.substring(0, 100)}...</p>
                      <div className="d-flex justify-content-between mt-2">
                        <Link to={`/auth/lesson/${lesson.id}`} className="btn btn-secondary">
                          Xem chi tiết
                        </Link>
                        <Link to={`/creator/lesson/edit/${lesson.id}`} className="btn btn-edit">
                          Chỉnh sửa
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-custom mt-4 d-flex justify-content-center gap-2 flex-wrap">
              <button className="btn btn-dark" disabled>
                Trang {currentPage} / {totalPages}
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`btn ${currentPage === i + 1 ? 'btn-danger' : 'btn-dark'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LessonListForCreator;
