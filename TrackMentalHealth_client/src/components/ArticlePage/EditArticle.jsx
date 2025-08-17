import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const EditArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [createdAt, setCreatedAt] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (error) {
      console.error('❌ Invalid token:', error);
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      status: false,
      photo: '',
    },
    onSubmit: async (values) => {
      const now = new Date().toISOString();
      const articleData = {
        ...values,
        id: articleId,
        status: values.status.toString(),
        updatedAt: now,
        photo: values.photo,
      };

      try {
        console.log('📦 Article data to update:', articleData);
        await axios.put(`http://localhost:9999/api/article/${articleId}`, articleData);

        Swal.fire({
          icon: 'success',
          title: '✅ Updated',
          text: 'Article updated successfully!',
        }).then(() => {
          navigate('/contentCreator/article'); // chuyển về trang article
        });
      } catch (error) {
        console.error('❌ Failed to update article:', error.response?.data || error.message);
        Swal.fire('❌ Error', 'An error occurred while updating the article.', 'error');
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
          photo: fetchedArticle.photo || '',
        });
        setCreatedAt(fetchedArticle.createdAt);
      } catch (err) {
        console.error('❌ Failed to load article:', err);
        Swal.fire('❌ Error', 'Failed to load article.', 'error');
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
      formik.setFieldValue('photo', url);
    } catch (err) {
      console.error('❌ Failed to upload image:', err.response?.data || err.message);
      Swal.fire('❌ Error', 'Image upload failed!', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">✏️ Edit Article</h2>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Article Title</label>
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
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                name="content"
                rows="6"
                onChange={formik.handleChange}
                value={formik.values.content}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="articlePhoto" className="form-label">Cover Image</label>
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
                    alt="Cover"
                    style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditArticle;
