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
      console.error('❌ Token không hợp lệ:', err);
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
      photo: '', // Thêm photo vào form
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      if (!values.mediaUrl) {
        alert('❌ Bạn cần upload tệp media trước khi cập nhật bài tập.');
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
        photo: values.photo, // Gửi ảnh minh họa lên server
      };

      try {
        console.log('📦 Dữ liệu gửi đi để cập nhật:', exerciseData);
        await axios.put(`http://localhost:9999/api/exercise/${exerciseId}`, exerciseData);
        alert('✅ Cập nhật bài tập thành công!');
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật bài tập:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi cập nhật bài tập.');
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
          photo: fetchedExercise.photo || '', // Set lại ảnh minh họa nếu có
        });
        setCreatedAt(fetchedExercise.createdAt);
      } catch (err) {
        console.error('❌ Không thể tải dữ liệu bài tập:', err);
        alert('❌ Không thể tải dữ liệu bài tập.');
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
          onSuccessCallback(url); // dùng cho ảnh minh họa
        }
        return;
      }

      formik.setFieldValue('mediaUrl', url);
      const fileType = file.type.startsWith('audio') ? 'audio' : 'video';
      formik.setFieldValue('mediaType', fileType);
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
          <h2 className="mb-4 text-primary">✏️ Chỉnh sửa Bài Tập</h2>

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

            {/* Ảnh minh họa */}
            <div className="mb-3">
              <label htmlFor="exercisePhoto" className="form-label">Ảnh minh họa</label>
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
                    alt="Ảnh minh họa"
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
                Kích hoạt bài tập
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Đang upload...' : '💾 Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExercise;
