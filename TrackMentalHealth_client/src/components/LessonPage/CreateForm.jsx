import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';

const LessonCreate = () => {
  const [steps, setSteps] = useState([
    { title: '', content: '', mediaType: 'Video', mediaUrl: '' },
  ]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
    },
    onSubmit: async (values) => {
      const user = JSON.parse(localStorage.getItem('credentials'));
      const userId = user?.id || user?.sub || ''; // fallback nếu bạn lưu token dưới `sub`

      const now = new Date().toISOString();

      const lessonData = {
        ...values,
        createdById: userId,
        createdAt: now,
        updatedAt: now,
        steps: steps,
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
    setSteps([...steps, { title: '', content: '', mediaType: 'Video', mediaUrl: '' }]);
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
                      <option value="Video">Video</option>
                      <option value="Image">Hình ảnh</option>
                      <option value="Audio">Âm thanh</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <input
                      type="text"
                      placeholder="Media URL"
                      className="form-control"
                      value={step.mediaUrl}
                      onChange={(e) => handleStepChange(index, 'mediaUrl', e.target.value)}
                    />
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
              <button type="submit" className="btn btn-primary w-100">
                🚀 Tạo bài học
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonCreate;
