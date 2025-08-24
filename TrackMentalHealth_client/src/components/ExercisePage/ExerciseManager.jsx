import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ExerciseManager = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9999/api/exercise/')
      .then(response => {
        const activeExercises = response.data.filter(
          ex => ex.status === true || ex.status === 'true'
        );
        setExercises(activeExercises);
      })
      .catch(error => console.error('❌ Error loading exercises:', error));
  }, []);

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Exercise List</h2>
        <p>Practice and improve your skills through exercises</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4 isotope-container" data-aos="fade-up" data-aos-delay="300">
          {exercises.length === 0 ? (
            <p>Loading data or no exercises available.</p>
          ) : (
            exercises.map(ex => {
              const imageUrl = ex.photo?.startsWith('http')
                ? ex.photo
                : ex.photo
                  ? `http://localhost:9999/uploads/${ex.photo}`
                  : 'assets/img/default-exercise.webp';

              return (
                <div
                  key={ex.id}
                  className="col-lg-6 col-md-6 portfolio-item isotope-item filter-exercise"
                >
                  <div className="portfolio-card">
                    <div className="portfolio-image">
                      <img
                        src={imageUrl}
                        className="img-fluid"
                        alt={ex.title}
                        loading="lazy"
                      />
                      <div className="portfolio-overlay">
                        <div className="portfolio-actions">
                          <Link to={`/user/exercise/${ex.id}`} className="details-link">
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-content">
                      {/* Hàng đầu tiên: mediaType bên trái, difficulty bên phải */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="category text-uppercase">{ex.mediaType}</span>

                        {ex.mediaType === "camera" && ex.difficultyLevel && (
                          <span
                            className={`badge ${
                              ex.difficultyLevel.toLowerCase() === "easy"
                                ? "bg-success"
                                : ex.difficultyLevel.toLowerCase() === "medium"
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {ex.difficultyLevel}
                          </span>
                        )}
                      </div>

                      <h3>
                        {ex.title?.length > 40
                          ? ex.title.substring(0, 40) + "..."
                          : ex.title}
                      </h3>
                      <p>
                        {ex.instruction?.length > 50
                          ? ex.instruction.substring(0, 50) + "..."
                          : ex.instruction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default ExerciseManager;
