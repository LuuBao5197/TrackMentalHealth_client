import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditArticle = () => {
  const { articleId } = useParams();
  const [createdAt, setCreatedAt] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      status: false,
      photo: '', // 👈 thêm photo vào initialValues
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();
      const articleData = {
        ...values,
        id: articleId,
        status: values.status.toString(),
        updatedAt: now,
        photo: values.photo, // 👈 gửi ảnh lên server
      };

      try {
        console.log('📦 Dữ liệu gửi đi để cập nhật:', articleData);
        await axios.put(`http://localhost:9999/api/article/${articleId}`, articleData);
        alert('✅ Cập nhật bài viết thành công!');
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật bài viết:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi cập nhật bài viết.');
      }
    },
  });

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;

      try {
        const res = await axios.get(`http://localhost:9999/api/article/${articleId}`);
        const fetchedArticle = res.data;

        formik.setValues({
          title: fetchedArticle.title || '',
          content: fetchedArticle.content || '',
          status: fetchedArticle.status === 'true' || fetchedArticle.status === true,
          photo: fetchedArticle.photo || '', // 👈 load ảnh nếu có
        });
        setCreatedAt(fetchedArticle.createdAt);
      } catch (err) {
        console.error('❌ Không thể tải dữ liệu bài viết:', err);
        alert('❌ Không thể tải dữ liệu bài viết.');
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleUploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = res.data.url;
      formik.setFieldValue('photo', url); // 👈 set ảnh sau khi upload
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
          <h2 className="mb-4 text-primary">✏️ Chỉnh sửa Bài Viết</h2>

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

            {/* Ảnh minh họa */}
            <div className="mb-3">
              <label htmlFor="articlePhoto" className="form-label">Ảnh minh họa</label>
              <input
                type="file"
                className="form-control"
                id="articlePhoto"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleUploadPhoto(file);
                  }
                }}
              />
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Ảnh minh họa"
                    style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }}
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
                Kích hoạt bài viết
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? '⏳ Đang upload ảnh...' : '💾 Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;
