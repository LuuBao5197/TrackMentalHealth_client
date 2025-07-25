
import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CreateLesson = () => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.contentCreatorId;
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
    }
  }

  const [steps, setSteps] = useState([
    { title: '', content: '', mediaType: '', mediaUrl: '' },
  ]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
      photo: '',
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      // Kiểm tra nếu ảnh đại diện chưa được tải lên
      if (!values.photo) {
        alert('❌ Ảnh đại diện là bắt buộc!');
        return;
      }

      const lessonData = {
        title: values.title,
        description: values.description,
        photo: values.photo,
        status: values.status.toString(),
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        lessonSteps: steps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title,
          content: step.content,
          mediaType: step.mediaType || null,
          mediaUrl: step.mediaUrl || null,
        })),
      };

      try {
        const response = await axios.post('http://localhost:9999/api/lesson/save', lessonData);
        alert('✅ Tạo bài học thành công!');
        formik.resetForm();
        setSteps([{ title: '', content: '', mediaType: '', mediaUrl: '' }]);
      } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || JSON.stringify(error.response?.data);

        if (status === 400) {
          alert(`❌ ${backendMessage}`);
        } else {
          alert(`❌ Lỗi từ server (${status || '??'}): ${backendMessage}`);
        }
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
      alert("❗ Cần có ít nhất một bước học.");
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
        alert('❌ Loại tệp không được hỗ trợ.');
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
      alert('❌ Upload thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">📝 Tạo Bài Học Mới</h2>

          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Tiêu đề bài học</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                onChange={formik.handleChange}
                value={formik.values.title}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="4"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="lessonPhoto" className="form-label">Ảnh đại diện bài học <span className="text-danger">*</span></label>
              <input
                type="file"
                className="form-control"
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
                required
              />
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Ảnh đại diện"
                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="form-check mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="statusCheck"
                name="status"
                onChange={formik.handleChange}
                checked={formik.values.status}
              />
              <label className="form-check-label" htmlFor="statusCheck">
                Kích hoạt bài học
              </label>
            </div>

            <hr />
            <h4 className="text-secondary mb-3">📚 Các Bước Học</h4>

            {steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-4 bg-light">
                <h5 className="mb-3">Bước {index + 1}</h5>

                <div className="mb-2">
                  <label htmlFor={`stepTitle-${index}`} className="form-label">Tiêu đề bước</label>
                  <input
                    type="text"
                    className="form-control"
                    id={`stepTitle-${index}`}
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor={`stepContent-${index}`} className="form-label">Nội dung bước</label>
                  <textarea
                    className="form-control"
                    id={`stepContent-${index}`}
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    rows="5"
                    placeholder="Nhập nội dung, có thể nhấn Enter để xuống dòng"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-12">
                    <label htmlFor={`stepMedia-${index}`} className="form-label">
                      Tệp media
                      {step.mediaType && ` (${step.mediaType.toUpperCase()})`}
                      {!step.mediaType && ` (Chưa chọn)`}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id={`stepMedia-${index}`}
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
                      <small className="text-muted d-block mt-1">
                        URL: {step.mediaUrl}
                      </small>
                    )}

                    {step.mediaUrl && !uploading && (
                      <div className="mt-2 text-center">
                        {step.mediaType === 'video' && (
                          <video controls src={step.mediaUrl} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
                        )}
                        {step.mediaType === 'audio' && (
                          <audio controls src={step.mediaUrl} style={{ maxWidth: '100%' }} />
                        )}
                        {step.mediaType === 'photo' && (
                          <img src={step.mediaUrl} alt="Media Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain' }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {steps.length > 1 && (
                  <div className="text-end mt-3">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeStep(index)}
                    >
                      ❌ Xoá bước này
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="btn btn-outline-secondary mb-4" onClick={addStep}>
              + Thêm bước học
            </button>

            <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? '⏳ Đang upload...' : '🚀 Tạo bài học'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
