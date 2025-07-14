import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// ...

const token = localStorage.getItem('token');
let contentCreatorId = null;

if (token) {
  try {
    const decoded = jwtDecode(token);
    contentCreatorId = decoded.contentCreatorId; // hoặc tên field phù hợp trong token
  } catch (err) {
    console.error('❌ Token không hợp lệ:', err);
  }
}

const CreateExercise = () => {
  const [uploading, setUploading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: '',
      instruction: '',
      mediaUrl: '',
      mediaType: '',
      estimatedDuration: 0,
      status: false,
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();
    
      if (!values.mediaUrl) {
        alert('❌ Bạn cần upload tệp media trước khi tạo bài tập.');
        return;
      }
    
      const exerciseData = {
        ...values,
        status: values.status.toString(),
        estimatedDuration: parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId, // ✅ Gán đúng người tạo
        createdAt: now,
      };
    
      try {
        console.log('📦 Dữ liệu gửi:', exerciseData);
        await axios.post('http://localhost:9999/api/exercise/', exerciseData);
        alert('✅ Tạo bài tập thành công!');
        formik.resetForm();
      } catch (error) {
        console.error('❌ Lỗi khi tạo bài tập:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi tạo bài tập.');
      }
    },    
  });

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      formik.setFieldValue('mediaUrl', url);

      // Nhận dạng loại file
      const fileType = file.type.startsWith('audio') ? 'audio' : 'video';
      formik.setFieldValue('mediaType', fileType);

      // Tính thời lượng bằng giây
      estimateDurationFromFile(file);
    } catch (err) {
      console.error('❌ Upload thất bại:', err.response?.data || err.message);
      alert('❌ Upload thất bại!');
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
      console.log('⏱ Thời lượng media:', duration, 'giây');
    };

    media.onerror = () => {
      console.error('❌ Không thể đọc thời lượng file.');
    };
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">🏋️‍♂️ Tạo Bài Tập</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tiêu đề</label>
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
              <label className="form-label">Hướng dẫn</label>
              <textarea
                name="instruction"
                rows="4"
                className="form-control"
                onChange={formik.handleChange}
                value={formik.values.instruction}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Tệp Media (.mp3, .mp4)</label>
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
                  Loại: {formik.values.mediaType} | Thời lượng: {formik.values.estimatedDuration}s
                </small>
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
                Kích hoạt bài tập
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Đang upload...' : '🚀 Tạo bài tập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExercise;
