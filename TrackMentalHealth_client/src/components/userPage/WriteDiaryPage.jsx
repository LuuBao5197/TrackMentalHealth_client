// 📁 src/components/diary/WriteDiaryPage.js
import React, { useState } from 'react';
import { createDiary } from '../../api/diaryAPI';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/WriteDiaryPage.css'; // Separate CSS for styling effects

const WriteDiaryPage = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDiary({ content });
      alert('📝 Diary saved successfully!');
      navigate('/history');
    } catch (error) {
      console.error(error);
      alert('❌ An error occurred while saving the diary.');
    }
  };

  return (
    <div className="diary-container">
      <div className="diary-card">
        <h2 className="diary-title">🧘‍♀️ Write Emotion Diary</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="diary-textarea"
            placeholder="Write down what you are thinking and feeling..."
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>s
          <button type="submit" className="diary-button">
            💾 Save Diary
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteDiaryPage;
