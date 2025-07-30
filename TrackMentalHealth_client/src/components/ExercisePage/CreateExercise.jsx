import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'; // ✅ Thêm SweetAlert2

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
      photo: '',
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();

      if (!values.mediaUrl) {
        Swal.fire({
          icon: 'error',
          title: 'Thiếu tệp media',
          text: '❌ Bạn cần upload tệp media trước khi tạo bài tập.',
        });
        return;
      }

      const exerciseData = {
        ...values,
        status: values.status.toString(),
        estimatedDuration: parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId,
        createdAt: now,
        photo: values.photo,
      };

      try {
        console.log('📦 Dữ liệu gửi:', exerciseData);
        await axios.post('http://localhost:9999/api/exercise/', exerciseData);
        Swal.fire({
          icon: 'success',
          title: '✅ Thành công',
          text: 'Tạo bài tập thành công!',
        });
        formik.resetForm();
      } catch (error) {
        const status = error.response?.status;
        const backendMessage =
          error.response?.data?.message || JSON.stringify(error.response?.data);

        if (status === 400) {
          Swal.fire({
            icon: 'error',
            title: '❌ Dữ liệu không hợp lệ',
            text: backendMessage,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: `❌ Lỗi từ server (${status || '??'})`,
            text: backendMessage,
          });
        }

        console.error('❌ Lỗi khi tạo bài tập:', error.response?.data || error.message);
      }
    },
  });

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
          onSuccessCallback(url);
        }
        return;
      }

      formik.setFieldValue('mediaUrl', url);
      const fileType = file.type.startsWith('audio') ? 'audio' : 'video';
      formik.setFieldValue('mediaType', fileType);

      estimateDurationFromFile(file);
    } catch (err) {
      console.error('❌ Upload thất bại:', err.response?.data || err.message);
      Swal.fire({
        icon: 'error',
        title: '❌ Upload thất bại',
        text: 'Không thể upload tệp. Vui lòng thử lại.',
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
