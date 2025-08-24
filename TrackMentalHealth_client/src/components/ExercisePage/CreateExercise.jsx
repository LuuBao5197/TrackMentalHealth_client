import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

// Predefined condition types for the select box
const CONDITION_TYPES = [
  { value: 'LEFT_HAND_UP', label: 'Left Hand Up' },
  { value: 'RIGHT_HAND_UP', label: 'Right Hand Up' },
  { value: 'TURN_HEAD_UP', label: 'Turn Head Up' },
  { value: 'TURN_HEAD_DOWN', label: 'Turn Head Down' },
  { value: 'TURN_HEAD_LEFT', label: 'Turn Head Left' },
  { value: 'TURN_HEAD_RIGHT', label: 'Turn Head Right' },
  { value: 'LEFT_KNEE_UP', label: 'Left Knee Up' },
  { value: 'RIGHT_KNEE_UP', label: 'Right Knee Up' },
];

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
  const [conditions, setConditions] = useState([]);

  // Validation
  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.instruction) errors.instruction = 'Instruction is required';
    if (values.mediaType !== 'camera' && !values.mediaUrl) errors.mediaUrl = 'Media file is required';
    if (!values.photo) errors.photo = 'Thumbnail image is required';
    if (!values.difficultyLevel) errors.difficultyLevel = 'Difficulty level is required';

    // Validate conditions if camera
    if (values.mediaType === 'camera') {
      conditions.forEach((condition, index) => {
        if (!condition.type) errors[`condition_${index}_type`] = 'Type is required';
        if (!condition.description) errors[`condition_${index}_description`] = 'Description is required';
        if (!condition.duration || condition.duration <= 0)
          errors[`condition_${index}_duration`] = 'Duration must be positive';
      });
    }
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
      difficultyLevel: '', // 👈 thêm field
    },
    validate,
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      const exerciseData = {
        ...values,
        status: false,
        estimatedDuration:
          values.mediaType === 'camera'
            ? conditions.reduce((sum, c) => sum + (parseInt(c.duration, 10) || 0), 0)
            : parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId,
        createdAt: now,
      };

      try {
        const exerciseResponse = await axios.post('http://localhost:9999/api/exercise/', exerciseData);
        const exerciseId = exerciseResponse.data.id;

        if (values.mediaType === 'camera') {
          for (const condition of conditions) {
            await axios.post(`http://localhost:9999/api/exercises/${exerciseId}/conditions`, {
              type: condition.type,
              description: condition.description,
              duration: parseInt(condition.duration, 10),
              stepOrder: condition.stepOrder,
            });
          }
        }

        Swal.fire({
          icon: 'success',
          title: '✅ Success',
          text: 'Exercise and conditions created successfully!',
        });
        formik.resetForm();
        setConditions([]);
      } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || JSON.stringify(error.response?.data);
        Swal.fire({
          icon: 'error',
          title: status === 400 ? '❌ Invalid Data' : `❌ Server Error (${status || '??'})`,
          text: backendMessage,
        });
      }
    },
    validateOnChange: false,
    validateOnBlur: false,
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
    } catch {
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
  };

  const addCondition = () => {
    setConditions([...conditions, { type: '', description: '', duration: '', stepOrder: conditions.length + 1 }]);
  };

  const updateCondition = (index, field, value) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const removeCondition = (index) => {
    const updated = conditions.filter((_, i) => i !== index);
    updated.forEach((c, i) => (c.stepOrder = i + 1));
    setConditions(updated);
  };

  useEffect(() => {
    if (formik.values.mediaType === 'camera' && conditions.length === 0) {
      setConditions([{ type: '', description: '', duration: '', stepOrder: 1 }]);
    } else if (formik.values.mediaType !== 'camera') {
      setConditions([]);
      formik.setFieldValue('estimatedDuration', 0);
    }
  }, [formik.values.mediaType]);

  useEffect(() => {
    if (formik.values.mediaType === 'camera') {
      const total = conditions.reduce((sum, c) => sum + (parseInt(c.duration, 10) || 0), 0);
      formik.setFieldValue('estimatedDuration', total);
    }
  }, [conditions]);

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">🏋️‍♂️ Create Exercise</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                className={`form-control ${formik.errors.title && formik.touched.title ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="invalid-feedback">{formik.errors.title}</div>
              )}
            </div>

            {/* Instruction */}
            <div className="mb-3">
              <label className="form-label">Instruction</label>
              <textarea
                name="instruction"
                rows="4"
                className={`form-control ${formik.errors.instruction && formik.touched.instruction ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.instruction}
              />
              {formik.touched.instruction && formik.errors.instruction && (
                <div className="invalid-feedback">{formik.errors.instruction}</div>
              )}
            </div>

            {/* Difficulty Level (only for camera) */}
            {formik.values.mediaType === 'camera' && (
              <div className="mb-3">
                <label className="form-label">Difficulty Level</label>
                <select
                  name="difficultyLevel"
                  className={`form-control ${formik.errors.difficultyLevel && formik.touched.difficultyLevel ? 'is-invalid' : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.difficultyLevel}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {formik.touched.difficultyLevel && formik.errors.difficultyLevel && (
                  <div className="invalid-feedback">{formik.errors.difficultyLevel}</div>
                )}
              </div>
            )}


            {/* Media type */}
            <div className="mb-3">
              <label className="form-label">Media Type</label>
              <select
                name="mediaType"
                className={`form-control ${formik.errors.mediaType && formik.touched.mediaType ? 'is-invalid' : ''}`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.mediaType}
              >
                <option value="">Select media type</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="camera">Camera</option>
              </select>
              {formik.touched.mediaType && formik.errors.mediaType && (
                <div className="invalid-feedback">{formik.errors.mediaType}</div>
              )}
            </div>

            {/* Media upload */}
            {formik.values.mediaType !== 'camera' && (
              <div className="mb-3">
                <label className="form-label">Media File (.mp3, .mp4)</label>
                <input
                  type="file"
                  accept=".mp3,.mp4"
                  className={`form-control ${formik.errors.mediaUrl && formik.touched.mediaUrl ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleUpload(file);
                  }}
                />
                {formik.touched.mediaUrl && formik.errors.mediaUrl && (
                  <div className="invalid-feedback">{formik.errors.mediaUrl}</div>
                )}
                {formik.values.mediaUrl && (
                  <small className="text-muted d-block mt-1">
                    URL: {formik.values.mediaUrl} | Type: {formik.values.mediaType} | Duration: {formik.values.estimatedDuration}s
                  </small>
                )}
              </div>
            )}

            {/* Thumbnail */}
            <div className="mb-3">
              <label className="form-label">Thumbnail Image</label>
              <input
                type="file"
                className={`form-control ${formik.errors.photo && formik.touched.photo ? 'is-invalid' : ''}`}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file, (url) => formik.setFieldValue('photo', url));
                }}
              />
              {formik.touched.photo && formik.errors.photo && (
                <div className="invalid-feedback">{formik.errors.photo}</div>
              )}
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

            {/* Conditions for camera */}
            {formik.values.mediaType === 'camera' && (
              <div className="mb-3">
                <h4 className="text-primary">Exercise Conditions</h4>
                <p className="text-muted">Total Duration: {formik.values.estimatedDuration}s</p>
                {conditions.map((condition, index) => (
                  <div key={index} className="card mb-2 p-3">
                    <div className="row align-items-center" style={{ minHeight: '60px' }}>
                      {/* Type */}
                      <div className="col-md-3">
                        <label className="form-label mb-0">Type</label>
                        <select
                          className={`form-control ${formik.errors[`condition_${index}_type`] ? 'is-invalid' : ''}`}
                          value={condition.type}
                          onChange={(e) => updateCondition(index, 'type', e.target.value)}
                        >
                          <option value="">Select type</option>
                          {CONDITION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {formik.errors[`condition_${index}_type`] && (
                          <div className="invalid-feedback">{formik.errors[`condition_${index}_type`]}</div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="col-md-4">
                        <label className="form-label mb-0">Description</label>
                        <input
                          type="text"
                          className={`form-control ${formik.errors[`condition_${index}_description`] ? 'is-invalid' : ''}`}
                          value={condition.description}
                          onChange={(e) => updateCondition(index, 'description', e.target.value)}
                          placeholder="e.g., Raise your left hand for 4s"
                        />
                        {formik.errors[`condition_${index}_description`] && (
                          <div className="invalid-feedback">{formik.errors[`condition_${index}_description`]}</div>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="col-md-2">
                        <label className="form-label mb-0">Duration (s)</label>
                        <input
                          type="number"
                          min={1}
                          className={`form-control ${formik.errors[`condition_${index}_duration`] ? 'is-invalid' : ''}`}
                          value={condition.duration}
                          onChange={(e) => updateCondition(index, 'duration', e.target.value)}
                        />
                        {formik.errors[`condition_${index}_duration`] && (
                          <div className="invalid-feedback">
                            {formik.errors[`condition_${index}_duration`]}
                          </div>
                        )}
                      </div>

                      {/* Step order */}
                      <div className="col-md-2">
                        <label className="form-label mb-0">Step</label>
                        <input
                          type="number"
                          className="form-control"
                          value={condition.stepOrder}
                          disabled
                        />
                      </div>

                      {/* Delete button */}
                      <div className="col-md-1 d-flex align-items-center justify-content-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-circle shadow-sm"
                          title="Remove condition"
                          onClick={() => removeCondition(index)}
                          disabled={conditions.length === 1}
                          style={{
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary w-100" onClick={addCondition}>
                  ➕ Add Condition
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn btn-success w-100" disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '🚀 Create Exercise'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExercise;
