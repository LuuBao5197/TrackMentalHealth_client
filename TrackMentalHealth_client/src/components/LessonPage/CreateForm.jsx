import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';

const LessonCreate = () => {
  const [steps, setSteps] = useState([
    { title: '', content: '', mediaType: 'video', mediaUrl: '' },
  ]);

  const [uploading, setUploading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
      photo: '',
    },
    onSubmit: async (values) => {
      const user = JSON.parse(localStorage.getItem('credentials'));
      const userId = user?.id || user?.sub || '';
      const now = new Date().toISOString();

      const lessonData = {
        ...values,
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        lessonSteps: steps.map((step, index) => ({
          stepNumber: index + 1,
          ...step,
        })),
      };

      try {
        await axios.post('http://localhost:9999/api/lessons/save', lessonData);
        alert('✅ Tạo bài học thành công!');
      } catch (error) {
        console.error('❌ Lỗi khi tạo bài học:', error);
        alert('❌ Có lỗi xảy ra khi tạo bài học.');
      }
    },
  });

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { title: '', content: '', mediaType: 'video', mediaUrl: '' }]);
  };

  const handleUpload = async (file, onSuccess) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url;
      onSuccess(url);
    } catch (err) {
      console.error('Upload failed:', err);
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

          <form onSubmit={formik.handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-12">
                <label className="form-label">Tiêu đề bài học</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  onChange={formik.handleChange}
                  value={formik.values.title}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  onChange={formik.handleChange}
                  value={formik.values.description}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label">Ảnh đại diện bài học (file)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleUpload(file, (url) => formik.setFieldValue('photo', url));
                    }
                  }}
                />
                {formik.values.photo && (
                  <div className="mt-2">
                    <img
                      src={formik.values.photo}
                      alt="Preview"
                      style={{ maxHeight: '150px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-check mt-3 ms-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="status"
                  onChange={formik.handleChange}
                  checked={formik.values.status}
                  id="statusCheck"
                />
                <label className="form-check-label" htmlFor="statusCheck">
                  Kích hoạt bài học
                </label>
              </div>
            </div>

            <hr />
            <h4 className="text-secondary">📚 Các Bước Học</h4>

            {steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-4 bg-light">
                <h5 className="mb-3">Bước {index + 1}</h5>

                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Tiêu đề bước"
                    className="form-control"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <textarea
                    placeholder="Nội dung bước"
                    className="form-control"
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    rows="3"
                  ></textarea>
                </div>

                <div className="mb-2 row g-2">
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={step.mediaType}
                      onChange={(e) => handleStepChange(index, 'mediaType', e.target.value)}
                    >
                      <option value="video">Video</option>
                      <option value="photo">Hình ảnh</option>
                      <option value="audio">Âm thanh</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      accept="video/*,image/*,audio/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleUpload(file, (url) =>
                            handleStepChange(index, 'mediaUrl', url)
                          );
                        }
                      }}
                    />
                    {step.mediaUrl && (
                      <small className="text-muted d-block mt-1">{step.mediaUrl}</small>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline-secondary mb-3"
              onClick={addStep}
            >
              + Thêm bước học
            </button>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={uploading}
              >
                {uploading ? '⏳ Đang upload...' : '🚀 Tạo bài học'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonCreate;
