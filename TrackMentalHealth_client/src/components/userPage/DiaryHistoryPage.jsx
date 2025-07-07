// 📁 src/components/diary/DiaryHistoryPage.js
import React, { useEffect, useState } from 'react';
import { getDiaries } from '../../api/diaryAPI';
import { Link } from 'react-router-dom';

const DiaryHistoryPage = () => {
  const [diaries, setDiaries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDiaries();
        setDiaries(res.data);
      } catch (err) {
        console.error(err);
        alert('Không thể tải nhật ký');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Lịch sử nhật ký</h2>
      {diaries.length === 0 ? (
        <p>Chưa có nhật ký nào.</p>
      ) : (
        <ul className="list-group">
          {diaries.map((diary) => (
            <li className="list-group-item" key={diary.id}>
              <div className="d-flex justify-content-between">
                <span>{diary.date}</span>
                <Link to={`/edit-diary/${diary.id}`} className="btn btn-sm btn-outline-secondary">Chỉnh sửa</Link>
              </div>
              <p className="mt-2 mb-0">{diary.content.substring(0, 100)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiaryHistoryPage;
