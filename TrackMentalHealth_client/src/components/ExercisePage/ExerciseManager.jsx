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
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Danh sách bài tập</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {exercises.length === 0 ? (
          <p>Đang tải dữ liệu hoặc không có bài tập nào.</p>
        ) : (
          exercises.map(ex => (
            <div key={ex.id} style={{
              width: '300px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{ex.title}</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {ex.instruction?.substring(0, 100)}...
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Thời lượng ước tính: {ex.estimatedDuration} phút
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Media: {ex.mediaType} ({ex.mediaUrl})
                </p>
                <p style={{ fontSize: '12px', color: '#aaa' }}>
                  Ngày tạo: {new Date(ex.createdAt).toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Trạng thái: {ex.status === "false" ? "Ẩn" : "Hiển thị"}
                </p>
                <Link to={`/auth/exercise/${ex.id}`} style={{
                  marginTop: '10px',
                  display: 'inline-block',
                  color: '#007bff',
                  textDecoration: 'none'
                }}>
                  Xem thêm →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseManager;
