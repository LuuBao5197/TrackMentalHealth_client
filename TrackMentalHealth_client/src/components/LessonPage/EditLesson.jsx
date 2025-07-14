import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditLesson = () => {
  const { lessonId } = useParams();
  const [steps, setSteps] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [lesson, setLesson] = useState(null);

  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.contentCreatorId;
    } catch (error) {
      console.error('Token không hợp lệ:', error);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
      photo: '',
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();
      const lessonData = {
        ...values,
        id: lessonId,
        createdBy: userId,
        updatedAt: now,
        createdAt: createdAt || now,
        photo: values.photo && values.photo.trim() !== '' ? values.photo : lesson?.photo || '',
        lessonSteps: steps.map((step, index) => ({
          stepNumber: index + 1,
          title: step.title,
          content: step.content,
          mediaType: step.mediaType,
          mediaUrl: step.mediaUrl || (lesson.lessonSteps?.[index]?.mediaUrl ?? '')
        })),
      };

      console.log('🔍 Dữ liệu gửi đi:', lessonData);

      try {
        await axios.post('http://localhost:9999/api/lesson/save', lessonData);
        alert('✅ Bài học đã được cập nhật!');
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật:', error);
        alert('❌ Có lỗi xảy ra khi cập nhật bài học.');
      }
    },
  });

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/api/lesson/${lessonId}`);
        const fetchedLesson = res.data;

        formik.setValues({
          title: fetchedLesson.title || '',
          description: fetchedLesson.description || '',
          status: fetchedLesson.status === 'true' || fetchedLesson.status === true,
          photo: fetchedLesson.photo || '',
        });

        setLesson(fetchedLesson);
        setCreatedAt(fetchedLesson.createdAt);
        setSteps(fetchedLesson.lessonSteps || []);
      } catch (err) {
        console.error('❌ Không thể tải dữ liệu bài học:', err);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

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
          <h2 className="mb-4 text-primary">
            ✏️ {lessonId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
          </h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
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

            <div className="mb-3">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-control"
                name="description"
                rows="4"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ảnh đại diện bài học</label>

              {lesson?.photo && !formik.values.photo && (
                <div className="mb-2">
                  <strong>Ảnh hiện tại:</strong>
                  <div className="mt-1">
                    <img
                      src={lesson.photo}
                      alt="Ảnh hiện tại"
                      style={{ maxHeight: '150px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              )}

              {formik.values.photo && (
                <div className="mb-2">
                  <strong>Ảnh mới:</strong>
                  <div className="mt-1">
                    <img
                      src={formik.values.photo}
                      alt="Ảnh mới"
                      style={{ maxHeight: '150px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              )}

              <input
                type="file"
                className="form-control mt-2"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleUpload(file, (url) => formik.setFieldValue('photo', url));
                  }
                }}
              />
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
                Kích hoạt bài học
              </label>
            </div>

            <hr />
            <h4 className="text-secondary mb-3">📚 Các Bước Học</h4>

            {steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-4 bg-light">
                <h5 className="mb-3">Bước {index + 1}</h5>

                <div className="mb-2">
                  <label className="form-label">Tiêu đề bước</label>
                  <input
                    type="text"
                    className="form-control"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Nội dung bước</label>
                  <textarea
                    className="form-control"
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    rows="5"
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">Loại media</label>
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
                    <label className="form-label">Tệp media</label>
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
              className="btn btn-outline-secondary mb-4"
              onClick={addStep}
            >
              + Thêm bước học
            </button>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Đang tải lên...' : '💾 Lưu bài học'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLesson;
