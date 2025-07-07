import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const LessonDetails = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:9999/api/lessons/${id}`)
      .then(res => {
        setLesson(res.data);
        console.log('Dữ liệu bài học:', res.data);
      })
      .catch(err => console.error('Lỗi khi tải chi tiết bài học:', err));
  }, [id]);

  if (!lesson) return <p>Đang tải chi tiết bài học...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>

      <h3>Các bước trong bài học:</h3>
      {lesson.lessonSteps && lesson.lessonSteps.length > 0 ? (
        <ul>
          {lesson.lessonSteps.map((step, index) => (
            <li key={step.id}>
              <strong>Bước {step.stepNumber}:</strong> {step.title}
              <p>{step.content}</p>
              {step.mediaType === 'video' ? (
                <video controls width="400" src={step.mediaUrl}></video>
              ) : (
                <img src={step.mediaUrl} alt={step.title} style={{ maxWidth: '100%', marginTop: '10px' }} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có bước học nào.</p>
      )}
    </div>
  );
};

export default LessonDetails;