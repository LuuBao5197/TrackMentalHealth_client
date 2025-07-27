import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BsBell } from 'react-icons/bs';

const LessonDetail = () => {
  const { id } = useParams(); // id của bài học
  const [lesson, setLesson] = useState(null);
  const stepRefs = useRef({}); // lưu ref của từng step
  const observer = useRef(null);
  const userId = 1; // user giả định (bạn có thể thay đổi thành user thực)

  useEffect(() => {
    axios.get(`http://localhost:9999/api/lesson/${id}`)
      .then(res => setLesson(res.data))
      .catch(err => console.error('Lỗi khi tải chi tiết bài học:', err));
  }, [id]);

  useEffect(() => {
    if (!lesson || !lesson.lessonSteps) return;

    // Bước 1: Gọi API lấy danh sách bước đã hoàn thành từ SQL
    axios.get(`http://localhost:9999/api/user/${userId}/lesson/${lesson.id}/progress`)
      .then((res) => {
        // Giả sử mỗi phần tử trong res.data là 1 đối tượng có .step.id
        const completedSteps = res.data
        .filter(progress => progress.step && progress.step.id)
        .map(progress => progress.step.id);


        // Bước 2: Tạo observer theo dõi khi user nhìn thấy step
        observer.current = new IntersectionObserver(entries => {
          entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
              const stepId = parseInt(entry.target.dataset.stepId);

              // Nếu chưa có trong danh sách thì gửi POST
              if (!completedSteps.includes(stepId)) {
                try {
                  await axios.post('http://localhost:9999/api/user/progress/update', {
                    lessonId: lesson.id,
                    stepCompleted: stepId,
                    userId: userId
                  });
                  console.log(`✅ Đã cập nhật step ${stepId} vào progress`);

                  // Cập nhật local array để tránh gửi lại
                  completedSteps.push(stepId);
                } catch (err) {
                  console.error(`❌ Lỗi cập nhật step ${stepId}:`, err);
                }
              } else {
                console.log(`⏩ Step ${stepId} đã được lưu trong progress`);
              }
            }
          });
        }, { threshold: 0.5 });

        // Bước 3: Gán observer cho mỗi step
        lesson.lessonSteps.forEach(step => {
          const element = stepRefs.current[step.id];
          if (element) {
            observer.current.observe(element);
          }
        });
      })
      .catch(err => {
        console.error('❌ Lỗi khi lấy progress từ server:', err);
      });

    // Cleanup observer
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lesson]);

  if (!lesson) {
    return <p className="text-center p-4" style={{ fontSize: '1.5em' }}>Đang tải chi tiết bài học...</p>;
  }

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif', fontSize: '1.2em' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge-wrapper mb-3">
                <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
                  <div className="icon-circle me-2 text-primary"><BsBell /></div>
                  <span className="badge-text me-3 fw-bold" style={{ fontSize: '1.3em' }}>Giới thiệu bài học</span>
                </div>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3" style={{ fontSize: '3em' }}>{lesson.title}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Steps */}
      <h2 className="mb-4 border-bottom pb-2 text-primary" style={{ fontSize: '1.6em' }}>📌 Các bước trong bài học:</h2>
      {lesson.lessonSteps && lesson.lessonSteps.length > 0 ? (
        lesson.lessonSteps
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[step.id] = el)}
              data-step-id={step.id}
              className="mb-5"
            >
              <h4 className="fw-semibold text-secondary mb-2" style={{ fontSize: '1.5em' }}>
                Step {step.stepNumber}
              </h4>
              <p style={{ fontSize: '1.3em', margin: '0.5em 0', lineHeight: '1.8' }}>{step.title}</p>
              {step.mediaType === 'photo' && (
                <img
                  src={step.mediaUrl}
                  alt={step.title}
                  className="img-fluid rounded shadow-sm mx-auto d-block"
                  style={{ width: '70%', maxWidth: '70%', height: 'auto' }}
                />
              )}
              <p style={{ whiteSpace: 'pre-line', fontSize: '1.3em', margin: '1em 0', lineHeight: '1.3' }}>
                {step.content || `Nội dung bước ${step.stepNumber} (cập nhật?)`}
              </p>
            </div>
          ))
      ) : (
        <p className="text-muted fst-italic" style={{ fontSize: '1.3em', margin: '3em 0', lineHeight: '1.8' }}>
          Chưa có bước học nào.
        </p>
      )}
    </div>
  );
};

export default LessonDetail;
