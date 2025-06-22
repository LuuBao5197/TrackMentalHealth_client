import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LessonManager = () => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9999/api/lesson/')
      .then(response => setLessons(response.data))
      .catch(error => console.error('Error fetching lessons:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Danh sách bài học</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {lessons.length === 0 ? (
          <p>Đang tải dữ liệu hoặc không có bài học.</p>
        ) : (
          lessons.map(lesson => (
            <div key={lesson.id} style={{
              width: '300px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img
                src={lesson.image || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                alt="Lesson"
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{lesson.title}</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {lesson.description?.substring(0, 100)}...
                </p>
                <a href={`/lesson/${lesson.id}`} style={{ marginTop: '10px', display: 'inline-block', color: '#007bff', textDecoration: 'none' }}>
                  Xem thêm →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LessonManager;
