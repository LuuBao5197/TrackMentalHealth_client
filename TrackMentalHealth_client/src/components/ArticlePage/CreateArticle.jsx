import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CreateArticle = () => {
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId || decoded.contentCreatorId;
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      photo: '', // ✅ Trường ảnh bài viết
    },
    onSubmit: async (values) => {
      const articleData = {
        ...values,
        author: userId,
        status: false,
        createdAt: new Date().toISOString(),
      };

      try {
        await axios.post('http://localhost:9999/api/article/', articleData);
        alert('✅ Tạo bài viết thành công!');
        formik.resetForm();
      } catch (error) {
        console.log('📤 Dữ liệu gửi đi:', articleData);
        console.error('❌ Lỗi khi tạo bài viết:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi tạo bài viết.');
      }
    },
  });

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      formik.setFieldValue('photo', url); // ✅ Gán URL ảnh vào photo
    } catch (err) {
      console.error('❌ Upload ảnh thất bại:', err.response?.data || err.message);
      alert('❌ Upload ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">📝 Tạo Bài Viết Mới</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tiêu đề bài viết</label>
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
              <label className="form-label">Nội dung bài viết</label>
              <textarea
                className="form-control"
                name="content"
                rows="6"
                onChange={formik.handleChange}
                value={formik.values.content}
                required
              />
            </div>

            {/* Upload ảnh bài viết */}
            <div className="mb-3">
              <label className="form-label">Ảnh minh họa</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file);
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

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Đang upload...' : '🚀 Tạo bài viết'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
