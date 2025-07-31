import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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

const CreateExercise = () => {
  const [uploading, setUploading] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.instruction) errors.instruction = 'Instruction is required';
    if (!values.mediaUrl) errors.mediaUrl = 'Media file is required';
    if (!values.photo) errors.photo = 'Thumbnail image is required';
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      instruction: '',
      mediaUrl: '',
      mediaType: '',
      estimatedDuration: 0,
      status: false,
      photo: '',
    },
    validate,
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      const exerciseData = {
        ...values,
        status: false,
        estimatedDuration: parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId,
        createdAt: now,
      };

      try {
        await axios.post('http://localhost:9999/api/exercise/', exerciseData);
        Swal.fire({
          icon: 'success',
          title: '✅ Success',
          text: 'Exercise created successfully!',
        });
        formik.resetForm();
      } catch (error) {
        const status = error.response?.status;
        const backendMessage =
          error.response?.data?.message || JSON.stringify(error.response?.data);

        Swal.fire({
          icon: 'error',
          title: status === 400 ? '❌ Invalid Data' : `❌ Server Error (${status || '??'})`,
          text: backendMessage,
        });
      }
    },
  });

  const handleUpload = async (file, onSuccess = null) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;

      if (file.type.startsWith('image/')) {
        if (onSuccess) onSuccess(url);
        return;
      }

      formik.setFieldValue('mediaUrl', url);
      const fileType = file.type.startsWith('audio') ? 'audio' : 'video';
      formik.setFieldValue('mediaType', fileType);

      estimateDurationFromFile(file);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '❌ Upload Failed',
        text: 'Could not upload the file. Please try again.',
      });
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
    };

    media.onerror = () => {
      console.error('❌ Could not read media duration.');
    };
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">🏋️‍♂️ Create Exercise</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className={`form-control ${formik.errors.title && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                value={formik.values.title}
              />
              {formik.errors.title && <div className="invalid-feedback">{formik.errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Instruction</label>
              <textarea
                name="instruction"
                rows="4"
                className={`form-control ${formik.errors.instruction && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                value={formik.values.instruction}
              />
              {formik.errors.instruction && <div className="invalid-feedback">{formik.errors.instruction}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Media File (.mp3, .mp4)</label>
              <input
                type="file"
                accept=".mp3,.mp4"
                className={`form-control ${formik.errors.mediaUrl && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file);
                }}
              />
              {formik.errors.mediaUrl && <div className="invalid-feedback">{formik.errors.mediaUrl}</div>}
              {formik.values.mediaUrl && (
                <small className="text-muted d-block mt-1">
                  URL: {formik.values.mediaUrl} | Type: {formik.values.mediaType} | Duration: {formik.values.estimatedDuration}s
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Thumbnail Image</label>
              <input
                type="file"
                className={`form-control ${formik.errors.photo && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file, (url) => formik.setFieldValue('photo', url));
                }}
              />
              {formik.errors.photo && <div className="invalid-feedback">{formik.errors.photo}</div>}
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Thumbnail"
                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Uploading...' : '🚀 Create Exercise'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExercise;
