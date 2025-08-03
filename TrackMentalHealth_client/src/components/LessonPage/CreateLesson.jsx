import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const CreateLesson = () => {
  const [uploading, setUploading] = useState(false);
  const [steps, setSteps] = useState([{ title: '', content: '', mediaType: '', mediaUrl: '' }]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.contentCreatorId;
    } catch (error) {
      console.error('❌ Invalid token:', error);
    }
  }

  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.description) errors.description = 'Description is required';
    if (!values.photo) errors.photo = 'Cover photo is required';
    if (!values.category) errors.category = 'Category is required';

    steps.forEach((step, index) => {
      if (!step.title || !step.content) {
        errors[`step-${index}`] = 'Each step must have a title and content';
      }
    });

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
      photo: '',
      category: '', // ✅ category field
    },
    validate,
    onSubmit: async (values) => {
      if (!userId) {
        Swal.fire({
          title: 'Not Logged In',
          text: 'You must log in to create a lesson. Do you want to log in now?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/login');
          }
        });
        return;
      }

      const now = new Date().toISOString();

      const lessonData = {
        title: values.title,
        description: values.description,
        photo: values.photo,
        status: 'false',
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        category: values.category, // ✅ include category
        lessonSteps: steps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title,
          content: step.content,
          mediaType: step.mediaType || null,
          mediaUrl: step.mediaUrl || null,
        })),
      };

      try {
        await axios.post('http://localhost:9999/api/lesson/save', lessonData);
        Swal.fire('✅ Success', 'Lesson created successfully!', 'success');
        formik.resetForm();
        setSteps([{ title: '', content: '', mediaType: '', mediaUrl: '' }]);
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
  });

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: '', content: '', mediaType: '', mediaUrl: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) {
      Swal.fire('⚠️ Cannot Remove', 'At least one step is required.', 'warning');
      return;
    }
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleUpload = async (file, stepIndex = -1, onSuccessCallback = null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      let detectedMediaType = '';

      if (file.type.startsWith('image/')) detectedMediaType = 'photo';
      else if (file.type.startsWith('video/')) detectedMediaType = 'video';
      else if (file.type.startsWith('audio/')) detectedMediaType = 'audio';
      else {
        Swal.fire('❌ Error', 'Unsupported file type.', 'error');
        setUploading(false);
        return;
      }

      if (stepIndex !== -1) {
        const updatedSteps = [...steps];
        updatedSteps[stepIndex].mediaUrl = url;
        updatedSteps[stepIndex].mediaType = detectedMediaType;
        setSteps(updatedSteps);
      } else if (onSuccessCallback) {
        onSuccessCallback(url);
      }
    } catch (err) {
      Swal.fire('❌ Upload Failed', 'File upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">📝 Create New Lesson</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Lesson Title</label>
              <input
                type="text"
                className={`form-control ${formik.errors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                onChange={formik.handleChange}
                value={formik.values.title}
              />
              {formik.errors.title && <div className="invalid-feedback">{formik.errors.title}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className={`form-control ${formik.errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                rows="4"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
              {formik.errors.description && <div className="invalid-feedback">{formik.errors.description}</div>}
            </div>

            {/* Category */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Lesson Category</label>
              <select
                className={`form-select ${formik.errors.category ? 'is-invalid' : ''}`}
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
              >
                <option value="">-- Select Category --</option>
                <option value="Emotional Skills">Emotional Skills</option>
                <option value="Stress Management">Stress Management</option>
                <option value="Self-Awareness">Self-Awareness</option>
                <option value="Motivation">Motivation</option>
              </select>
              {formik.errors.category && <div className="invalid-feedback">{formik.errors.category}</div>}
            </div>

            {/* Photo */}
            <div className="mb-3">
              <label htmlFor="lessonPhoto" className="form-label">Thumbnail Image <span className="text-danger">*</span></label>
              <input
                type="file"
                className={`form-control ${formik.errors.photo ? 'is-invalid' : ''}`}
                id="lessonPhoto"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleUpload(file, -1, (url) => formik.setFieldValue('photo', url));
                  } else {
                    formik.setFieldValue('photo', '');
                  }
                }}
              />
              {formik.errors.photo && <div className="invalid-feedback">{formik.errors.photo}</div>}
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Lesson Cover"
                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <hr />
            <h4 className="text-secondary mb-3">📚 Lesson Steps</h4>

            {steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-4 bg-light">
                <h5 className="mb-3">Step {index + 1}</h5>

                <div className="mb-2">
                  <label className="form-label">Step Title</label>
                  <input
                    type="text"
                    className={`form-control ${!step.title && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Step Content</label>
                  <textarea
                    className={`form-control ${!step.content && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    rows="5"
                    placeholder="Enter content, press Enter for new lines"
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">
                    Media File {step.mediaType && `(${step.mediaType.toUpperCase()})`}
                    {!step.mediaType && ' (Not selected)'}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="video/*,image/*,audio/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleUpload(file, index);
                      } else {
                        handleStepChange(index, 'mediaType', '');
                        handleStepChange(index, 'mediaUrl', '');
                      }
                    }}
                  />
                  {step.mediaUrl && (
                    <div className="mt-2 text-center">
                      {step.mediaType === 'video' && (
                        <video controls src={step.mediaUrl} style={{ maxWidth: '100%', maxHeight: '250px' }} />
                      )}
                      {step.mediaType === 'audio' && (
                        <audio controls src={step.mediaUrl} style={{ width: '100%' }} />
                      )}
                      {step.mediaType === 'photo' && (
                        <img src={step.mediaUrl} alt="Step Media" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                      )}
                    </div>
                  )}
                </div>

                {steps.length > 1 && (
                  <div className="text-end mt-3">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeStep(index)}
                    >
                      ❌ Remove this step
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="btn btn-outline-secondary mb-4" onClick={addStep}>
              + Add Step
            </button>

            <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '🚀 Create Lesson'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
