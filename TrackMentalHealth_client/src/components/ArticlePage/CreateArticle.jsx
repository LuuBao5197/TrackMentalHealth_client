import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const CreateArticle = () => {
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId || decoded.contentCreatorId;
    } catch (error) {
      console.error('❌ Invalid token:', error);
    }
  }

  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.content) errors.content = 'Content is required';
    if (!values.photo) errors.photo = 'Cover image is required';
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      photo: '',
    },
    validate,
    onSubmit: async (values) => {
      if (!userId) {
        Swal.fire({
          title: 'Not Logged In',
          text: 'You must log in to create an article. Do you want to log in now?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Login',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/login');
          }
        });
        return;
      }

      const articleData = {
        ...values,
        author: userId,
        status: false,
        createdAt: new Date().toISOString(),
      };

      try {
        await axios.post('http://localhost:9999/api/article/', articleData);
        Swal.fire('✅ Success', 'Article created successfully!', 'success');
        formik.resetForm();
      } catch (error) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message || JSON.stringify(error.response?.data);

        Swal.fire({
          icon: 'error',
          title: status === 400 ? '❌ Invalid Data' : `❌ Server Error (${status || '??'})`,
          text: backendMessage,
        });
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

      formik.setFieldValue('photo', res.data.url);
    } catch (err) {
      Swal.fire('❌ Upload Failed', 'Unable to upload image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">📝 Create New Article</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Article Title</label>
              <input
                type="text"
                className={`form-control ${formik.errors.title && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                name="title"
                onChange={formik.handleChange}
                value={formik.values.title}
              />
              {formik.errors.title && <div className="invalid-feedback">{formik.errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className={`form-control ${formik.errors.content && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                name="content"
                rows="6"
                onChange={formik.handleChange}
                value={formik.values.content}
              />
              {formik.errors.content && <div className="invalid-feedback">{formik.errors.content}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Thumbnail Image</label>
              <input
                type="file"
                className={`form-control ${formik.errors.photo && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleUpload(file);
                }}
              />
              {formik.errors.photo && <div className="invalid-feedback">{formik.errors.photo}</div>}
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Thumbnail"
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
              {uploading ? '⏳ Uploading...' : '🚀 Create Article'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
