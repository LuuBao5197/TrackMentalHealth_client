import React from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CreateArticle = () => {
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
    },
    onSubmit: async (values) => {
      const articleData = {
        ...values,
        author: userId,
        status: false, // 👈 luôn gửi mặc định là false
        createdAt: new Date().toISOString(),
      };

      try {
        await axios.post('http://localhost:9999/api/article/', articleData);
        alert('✅ Tạo bài viết thành công!');
        formik.resetForm();
      } catch (error) {
        console.log('📤 Dữ liệu gửi đi:', articleData);
        console.error('❌ Lỗi khi tạo bài viết:', error);
        alert('❌ Có lỗi xảy ra khi tạo bài viết.');
      }
    },
  });

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

            <button type="submit" className="btn btn-success w-100">
              🚀 Tạo bài viết
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
