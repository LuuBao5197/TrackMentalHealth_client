import React from 'react';
import { useFormik } from 'formik';
import axios from 'axios';

const CreateArticle = () => {
  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      status: false,
    },
    onSubmit: async (values) => {
      const articleData = {
        ...values,
        author: null, // Không lấy từ localStorage nữa
        createdAt: '2005-01-01T00:00:00', // đúng dữ liệu mẫu bạn muốn
      };

      try {
        await axios.post('http://localhost:9999/api/article/', articleData);
        alert('✅ Tạo bài viết thành công!');
        formik.resetForm();
      } catch (error) {
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
            {/* Tiêu đề */}
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

            {/* Nội dung */}
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

            {/* Trạng thái */}
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

            {/* Nút submit */}
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
