import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditExercise = () => {
  const { exerciseId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);

  const token = localStorage.getItem('token');
  let contentCreatorId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      contentCreatorId = decoded.contentCreatorId;
    } catch (err) {
      console.error('❌ Invalid token:', err);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      instruction: '',
      mediaUrl: '',
      mediaType: '',
      estimatedDuration: 0,
      status: false,
      photo: '', // Add photo to form
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      if (!values.mediaUrl) {
        alert('❌ Please upload a media file before updating the exercise.');
        return;
      }

      const exerciseData = {
        ...values,
        id: exerciseId,
        status: values.status.toString(),
        estimatedDuration: parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId,
        createdAt: createdAt || now,
        updatedAt: now,
        photo: values.photo, // Send illustration image to server
      };

      try {
        console.log('📦 Data to be submitted:', exerciseData);
        await axios.put(`http://localhost:9999/api/exercise/${exerciseId}`, exerciseData);
        alert('✅ Exercise updated successfully!');
      } catch (error) {
        console.error('❌ Failed to update exercise:', error.response?.data || error.message);
        alert('❌ An error occurred while updating the exercise.');
      }
    },
  });

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) return;

      try {
        const res = await axios.get(`http://localhost:9999/api/exercise/${exerciseId}`);
        const fetchedExercise = res.data;

        formik.setValues({
          title: fetchedExercise.title || '',
          instruction: fetchedExercise.instruction || '',
          mediaUrl: fetchedExercise.mediaUrl || '',
          mediaType: fetchedExercise.mediaType || '',
          estimatedDuration: fetchedExercise.estimatedDuration || 0,
          status: fetchedExercise.status === 'true' || fetchedExercise.status === true,
          photo: fetchedExercise.photo || '', // Set illustration image if available
        });
        setCreatedAt(fetchedExercise.createdAt);
      } catch (err) {
        console.error('❌ Failed to load exercise data:', err);
        alert('❌ Failed to load exercise data.');
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const handleUpload = async (file, stepIndex = -1, onSuccessCallback = null) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;

      if (file.type.startsWith('image/')) {
        if (onSuccessCallback) {
          onSuccessCallback(url); // for illustration image
        }
        return;
      }

      formik.setFieldValue('mediaUrl', url);
      const fileType = file.type.startsWith('audio') ? 'audio' : 'video';
      formik.setFieldValue('mediaType', fileType);
      estimateDurationFromFile(file);
    } catch (err) {
      console.error('❌ Upload failed:', err.response?.data || err.message);
      alert('❌ Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const estimateDurationFromFile = (file) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(file.type.startsWith('audio') ? 'audio' : 'video');

    media.preload = 'metadata';
    media.src = url;

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(media.src);
      const duration = Math.floor(media.duration);
      formik.setFieldValue('estimatedDuration', duration);
      console.log('⏱ Media duration:', duration, 'seconds');
    };

    media.onerror = () => {
      console.error('❌ Unable to read media duration.');
    };
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">✏️ Edit Exercise</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                onChange={formik.handleChange}
                value={formik.values.title}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Instruction</label>
              <textarea
                name="instruction"
                rows="4"
                className="form-control"
                onChange={formik.handleChange}
                value={formik.values.instruction}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Media File (.mp3, .mp4)</label>
              <input
                type="file"
                accept=".mp3,.mp4"
                className="form-control"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file);
                }}
              />
              {formik.values.mediaUrl && (
                <small className="text-muted d-block mt-1">
                  URL: {formik.values.mediaUrl}
                  <br />
                  Type: {formik.values.mediaType} | Duration: {formik.values.estimatedDuration}s
                </small>
              )}
              {formik.values.mediaUrl && !uploading && (
                <div className="mt-2">
                  {formik.values.mediaType === 'video' && (
                    <video controls src={formik.values.mediaUrl} style={{ maxWidth: '100%', maxHeight: '200px' }} />
                  )}
                  {formik.values.mediaType === 'audio' && (
                    <audio controls src={formik.values.mediaUrl} style={{ maxWidth: '100%' }} />
                  )}
                </div>
              )}
            </div>

            {/* Illustration Image */}
            <div className="mb-3">
              <label htmlFor="exercisePhoto" className="form-label">Illustration Image</label>
              <input
                type="file"
                className="form-control"
                id="exercisePhoto"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleUpload(file, -1, (url) => formik.setFieldValue('photo', url));
                  }
                }}
              />
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Illustration"
                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                name="status"
                onChange={formik.handleChange}
                checked={formik.values.status}
                id="statusCheck"
              />
              <label className="form-check-label" htmlFor="statusCheck">
                Activate this exercise
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExercise;
