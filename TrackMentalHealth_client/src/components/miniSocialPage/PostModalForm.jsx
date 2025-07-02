import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

function PostModalForm({ show, handleClose, onPostCreated }) {
  const [userId, setUserId] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) setUserId(user.id);
  }, []);

  const formik = useFormik({
    initialValues: {
      content: '',
      media_url: '',
      is_anonymous: false,
      status: 'approve'
    },
    validationSchema: Yup.object({
      content: Yup.string()
        .required('Không được để trống')
        .max(500, 'Không quá 500 ký tự')
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!userId) {
        alert("Không tìm thấy người dùng");
        return;
      }

      const payload = {
        user: { id: userId },
        ...values
      };

      try {
        await axios.post('http://localhost:9999/api/community/post', payload);
        resetForm();
        setPreview('');
        handleClose();
        if (onPostCreated) onPostCreated(); // gọi lại cha để load lại bài viết
      } catch (error) {
        console.error(error);
        alert("Đăng bài thất bại");
      }
    }
  });

  const handleMediaChange = (e) => {
    formik.handleChange(e);
    setPreview(e.target.value);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <form onSubmit={formik.handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            name="content"
            className={`form-control mb-2 ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''}`}
            placeholder="Bạn đang nghĩ gì thế?"
            rows="4"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          ></textarea>
          {formik.touched.content && formik.errors.content && (
            <div className="text-danger small">{formik.errors.content}</div>
          )}

          <input
            type="text"
            name="media_url"
            className="form-control mb-2"
            placeholder="Dán link ảnh/video (nếu có)"
            value={formik.values.media_url}
            onChange={handleMediaChange}
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="img-fluid rounded mb-2"
              loading="lazy"
            />
          )}

          <div className="form-check mb-2">
            <input
              type="checkbox"
              name="is_anonymous"
              className="form-check-input"
              checked={formik.values.is_anonymous}
              onChange={formik.handleChange}
            />
            <label className="form-check-label">Ẩn danh</label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            Đăng bài
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default PostModalForm;
