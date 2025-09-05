// src/components/ExercisePage/ExerciseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BsHeadphones } from 'react-icons/bs';

// ✅ Import trang camera
import CameraExercisePage from './CameraExercisePage';

const ExerciseDetail = () => {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:9999/api/exercise/${id}`)
      .then((res) => {
        setExercise(res.data);
      })
      .catch((err) => console.error('❌ Error loading exercise detail:', err));
  }, [id]);

  if (!exercise) return <p className="text-center p-4">Loading exercise details...</p>;

  // 📌 Nếu type là "camera" thì hiển thị luôn trang CameraExercisePage
  if (exercise.mediaType === 'camera') {
    return <CameraExercisePage />;
  }

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge-wrapper mb-3">
                <div className="d-inline-flex align-items-center rounded-pill border border-success px-3 py-1">
                  <div className="icon-circle me-2 text-success">
                    <BsHeadphones />
                  </div>
                  <span className="badge-text me-3 fw-bold">Exercise Introduction</span>
                </div>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3">{exercise.title}</h1>
              <p className="lead text-muted">📋 {exercise.instruction}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Media Section */}
      <div className="mb-5">
        <h2 className="mb-3 text-primary">🎧 Exercise Content</h2>

        {exercise.mediaType === 'audio' && (
          <audio controls className="w-100 mb-3" src={exercise.mediaUrl}>
            Your browser does not support audio.
          </audio>
        )}

        {exercise.mediaType === 'video' && (
          <video
            controls
            className="w-100 rounded shadow-sm mb-3"
            src={exercise.mediaUrl}
          >
            Your browser does not support video.
          </video>
        )}

        {exercise.estimatedDuration && (
          <p className="text-muted">
            ⏱️ Estimated Duration: {exercise.estimatedDuration} seconds
          </p>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetail;
