// 📁 src/components/diary/WriteDiaryPage.js
import React, { useState } from 'react';
import { createDiary } from '../../api/diaryAPI';
import { useNavigate } from 'react-router-dom';

const WriteDiaryPage = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDiary({ content });
      alert('Ghi nhật ký thành công!');
      navigate('/history');
    } catch (error) {
      console.error(error);
      alert('Đã có lỗi xảy ra khi ghi nhật ký.');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ghi nhật ký</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="8"
            placeholder="Nhập cảm xúc, suy nghĩ của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Lưu nhật ký</button>
      </form>
    </div>
  );
};

export default WriteDiaryPage;
