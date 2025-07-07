import React, { useState } from 'react';
import LessonManager from './LessonManager';
import ArticleManager from '../ArticlePage/ArticleManager';
import ExerciseManager from '../ExercisePage/ExerciseManager';

const AllForm = () => {
  const [activeTab, setActiveTab] = useState('Lesson'); // Đặt mặc định là Lesson

  return (
    <div style={{ padding: '20px' }}>
      <h2>Trang chính</h2>

      {/* Nút chọn */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        gap: '10px'
        }}>
        <button style={{ flex: 1 }} onClick={() => setActiveTab('Lesson')}>Lesson</button>
        <button style={{ flex: 1 }} onClick={() => setActiveTab('Article')}>Article</button>
        <button style={{ flex: 1 }} onClick={() => setActiveTab('Exercise')}>Exercise</button>
      </div>


      {/* Hiển thị nội dung */}
      <div>
        {activeTab === 'Lesson' && <LessonManager />}
        {activeTab === 'Article' && <ArticleManager />}
        {activeTab === 'Exercise' && <ExerciseManager />}
      </div>
    </div>
  );
};

export default AllForm;
