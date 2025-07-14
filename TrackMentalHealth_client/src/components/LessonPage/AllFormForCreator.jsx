import React, { useState } from 'react';

import LessonManager from '../LessonPage/LessonManager';
import ArticleManager from '../ArticlePage/ArticleManager';
import ExerciseManager from '../ExercisePage/ExerciseManager';
import LessonListForCreator from './LessonListForCreator';
import ArticleListForCreator from '../ArticlePage/ArticleListForCreator';
import ExerciseListForCreator from '../ExercisePage/ExerciseListForCreator';

const AllFormForCreator = () => {
  // ✅ Mặc định hiển thị Lesson
  const [activeFilter, setActiveFilter] = useState('filter-frontend');

  const renderContent = () => {
    switch (activeFilter) {
      case 'filter-frontend':
        return <LessonListForCreator />;
      case 'filter-backend':
        return <ArticleListForCreator />;
      case 'filter-design':
        return <ExerciseListForCreator />;
      default:
        return <LessonListForCreator />; // fallback an toàn
    }
  };

  return (
    <section id="portfolio" className="portfolio section">
      {/* Bộ lọc */}
      <div className="portfolio-filters-container" data-aos="fade-up" data-aos-delay="200">
        <ul className="portfolio-filters isotope-filters">
          {[
            { label: 'Lesson', value: 'filter-frontend' },
            { label: 'Article', value: 'filter-backend' },
            { label: 'Exercise', value: 'filter-design' },
          ].map((filter) => (
            <li
              key={filter.value}
              data-filter={filter.value}
              className={activeFilter === filter.value ? 'filter-active' : ''}
              onClick={() => setActiveFilter(filter.value)}
              style={{ cursor: 'pointer' }}
            >
              {filter.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Nội dung tương ứng */}
      <div className="container" data-aos="fade-up" data-aos-delay="300">
        {renderContent()}
      </div>
    </section>
  );
};

export default AllFormForCreator;
