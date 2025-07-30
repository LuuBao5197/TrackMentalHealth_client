// 📁 src/components/diary/WriteDiaryPage.js
import React, { useState } from 'react';
import { createDiary } from '../../api/diaryAPI';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/WriteDiaryPage.css'; // CSS riêng để styling hiệu ứng

const WriteDiaryPage = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDiary({ content });
      alert('📝 Ghi nhật ký thành công!');
      navigate('/history');
    } catch (error) {
      console.error(error);
      alert('❌ Đã có lỗi xảy ra khi ghi nhật ký.');
    }
  };

  return (
    <div className="diary-container">
      <div className="diary-card">
        <h2 className="diary-title">🧘‍♀️ Ghi Nhật Ký Cảm Xúc</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="diary-textarea"
            placeholder="Viết ra những điều bạn đang nghĩ, đang cảm nhận..."
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="diary-button">
            💾 Lưu Nhật Ký
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteDiaryPage;
