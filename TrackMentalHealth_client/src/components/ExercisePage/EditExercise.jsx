import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditExercise = () => {
  const { exerciseId } = useParams(); // Lấy exerciseId từ URL
  const [uploading, setUploading] = useState(false);
  const [createdAt, setCreatedAt] = useState(null); // Lưu thời gian tạo bài tập ban đầu

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
        alert('❌ Bạn cần upload tệp media trước khi cập nhật bài tập.');
        return;
      }

      const exerciseData = {
        ...values,
        id: exerciseId, // Thêm ID của bài tập để cập nhật
        status: values.status.toString(),
        estimatedDuration: parseInt(values.estimatedDuration || 0, 10),
        createdById: contentCreatorId, 
        createdAt: createdAt || now, // Giữ nguyên createdAt nếu đã có, nếu không thì dùng thời gian hiện tại
        updatedAt: now, // Cập nhật thời gian chỉnh sửa
      };

      try {
        console.log('📦 Dữ liệu gửi đi để cập nhật:', exerciseData);
        // Sử dụng phương thức PUT để cập nhật bài tập
        await axios.put(`http://localhost:9999/api/exercise/${exerciseId}`, exerciseData); 
        alert('✅ Cập nhật bài tập thành công!');
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật bài tập:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi cập nhật bài tập.');
      }
    },
  });

  // Fetch exercise data khi component mount hoặc exerciseId thay đổi
  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) return; // Đảm bảo có exerciseId trước khi fetch

      try {
        const res = await axios.get(`http://localhost:9999/api/exercise/${exerciseId}`);
        const fetchedExercise = res.data;

        // Set formik values với dữ liệu bài tập đã fetch
        formik.setValues({
          title: fetchedExercise.title || '',
          instruction: fetchedExercise.instruction || '',
          mediaUrl: fetchedExercise.mediaUrl || '',
          mediaType: fetchedExercise.mediaType || '',
          estimatedDuration: fetchedExercise.estimatedDuration || 0,
          status: fetchedExercise.status === 'true' || fetchedExercise.status === true,
        });
        setCreatedAt(fetchedExercise.createdAt); // Lưu lại createdAt
      } catch (err) {
        console.error('❌ Không thể tải dữ liệu bài tập:', err);
        alert('❌ Không thể tải dữ liệu bài tập.');
      }
    };

    fetchExercise();
  }, [exerciseId]); // Dependency array: chạy lại khi exerciseId thay đổi

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
              {/* Hiển thị media hiện tại nếu có và chưa upload file mới */}
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
              className="btn btn-primary w-100" // Đổi màu nút thành primary
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