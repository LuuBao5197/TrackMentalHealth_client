import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BsBell } from 'react-icons/bs'; // đảm bảo bạn đã cài react-icons

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:9999/api/lesson/${id}`)
      .then(res => {
        setLesson(res.data);
      })
      .catch(err => console.error('Lỗi khi tải chi tiết bài học:', err));
  }, [id]);

  useEffect(() => {
    if (!lesson) return;
    const progress = JSON.parse(localStorage.getItem('lessonProgress')) || {};
    if (!progress[lesson.id]) {
      progress[lesson.id] = { viewed: true, completed: false };
      localStorage.setItem('lessonProgress', JSON.stringify(progress));
    }
  }, [lesson]);

  if (!lesson) return <p className="text-center p-4">Đang tải chi tiết bài học...</p>;

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge-wrapper mb-3">
                <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
                  <div className="icon-circle me-2 text-primary"><BsBell /></div>
                  <span className="badge-text me-3 fw-bold">Giới thiệu bài học</span>
                </div>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3">{lesson.title}</h1>
              <p className="lead text-muted">🧠 Những điều bạn cần biết trước khi bắt đầu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Steps */}
      <h2 className="mb-4 border-bottom pb-2 text-primary">📌 Các bước trong bài học:</h2>
      {lesson.lessonSteps && lesson.lessonSteps.length > 0 ? (
        lesson.lessonSteps
          .sort((a, b) => a.stepNumber - b.stepNumber) // 🔁 Sắp xếp tăng dần theo stepNumber
          .map((step) => (
            <div key={step.id} className="mb-5">
              <h4 className="fw-semibold text-secondary mb-2">
                Step {step.stepNumber}
              </h4>
              <p>{step.title}</p>
              
              {step.mediaType === 'video' ? (
                <video
                  controls
                  className="w-100 rounded shadow-sm"
                  src={step.mediaUrl}
                />
              ) : (
                <img
                  src={step.mediaUrl}
                  alt={step.title}
                  className="img-fluid rounded shadow-sm mx-auto d-block"
                />
              )}

              {(step.content || `Nội dung bước ${step.stepNumber} (cập nhật?)`)}

            </div>
          ))
      ) : (
        <p className="text-muted fst-italic">Chưa có bước học nào.</p>
      )}

    </div>
  );
};

export default LessonDetail;
