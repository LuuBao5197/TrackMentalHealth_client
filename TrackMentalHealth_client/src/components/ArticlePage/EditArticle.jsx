import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditArticle = () => {
  const { articleId } = useParams(); // Lấy articleId từ URL
  const [createdAt, setCreatedAt] = useState(null); // Lưu thời gian tạo bài viết ban đầu
  // const [currentAuthorId, setCurrentAuthorId] = useState(null); // Không cần state này nếu không hiển thị

  const token = localStorage.getItem('token');
  let userId = null; // Đây là ID của người dùng đang đăng nhập

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId; // hoặc tên field phù hợp trong token của bạn
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      status: false,
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();
      const articleData = {
        ...values,
        id: articleId, // Thêm ID của bài viết để backend biết bài nào cần cập nhật
        status: values.status.toString(), // Chuyển đổi boolean thành string nếu API cần
        // KHÔNG GỬI TRƯỜNG 'author' ĐI NỮA
        // createdAt: createdAt || now, // Vẫn nên để backend quản lý hoàn toàn createdAt và updatedAt
        updatedAt: now, // Cập nhật thời gian chỉnh sửa (backend cũng nên tự động)
      };

      try {
        console.log('📦 Dữ liệu gửi đi để cập nhật (không có author):', articleData);
        await axios.put(`http://localhost:9999/api/article/${articleId}`, articleData); 
        alert('✅ Cập nhật bài viết thành công!');
        // Tùy chọn: chuyển hướng người dùng sau khi cập nhật
        // navigate('/articles'); 
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật bài viết:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi cập nhật bài viết.');
      }
    },
  });

  // Fetch article data khi component mount hoặc articleId thay đổi
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
        });
        setCreatedAt(fetchedArticle.createdAt); // Vẫn lưu để tham khảo nếu cần
        // setCurrentAuthorId(fetchedArticle.author); // Không cần set state này nếu không hiển thị
      } catch (err) {
        console.error('❌ Không thể tải dữ liệu bài viết:', err);
        alert('❌ Không thể tải dữ liệu bài viết.');
      }
    };

    fetchArticle();
  }, [articleId]);

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

            {/* ĐÃ BỎ ĐOẠN CODE HIỂN THỊ TÁC GIẢ KHÔNG CHỈNH SỬA ĐƯỢC Ở ĐÂY */}

            <button type="submit" className="btn btn-primary w-100">
              💾 Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;