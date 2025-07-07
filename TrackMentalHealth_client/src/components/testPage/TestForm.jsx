import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';

const TestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const currentUserId = 1; // giả lập user id đăng nhập

  const [loading, setLoading] = useState(isEditMode); // chỉ load khi edit

  const formik = useFormik({
    initialValues: {
      id: '',
      title: '',
      description: '',
      instructions: ''
    },
    validationSchema: Yup.object({
      // id: Yup.number().required('ID is required'),
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      instructions: Yup.string().required('Instructions are required')
    }),
    onSubmit: async (values) => {
      const payload = {
        ...values,
        created_by: currentUserId,
        created_at: new Date().toISOString().slice(0, 19)
      };

      try {
        if (isEditMode) {
          await axios.put(`http://localhost:9999/api/test/${id}`, payload);
          alert('Test updated!');
        } else {
          await axios.post('http://localhost:9999/api/test/', payload);
          alert('Test created!');
        }
        navigate('/test/list'); // chuyển về danh sách
      } catch (err) {
        alert('Error occurred!');
        console.error(err);
      }
    }
  });

  // Nếu đang ở chế độ edit, tự động load dữ liệu
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/api/test/${id}`);
        formik.setValues({
          id: res.data.id || '',
          title: res.data.title || '',
          description: res.data.description || '',
          instructions: res.data.instructions || ''
        });
      } catch (err) {
        alert('Không tìm thấy bài test');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchTest();
    }
  }, [id]);

  if (loading) return <div className="container mt-4">Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? 'Edit Test' : 'Create Test'}</h3>
      <form onSubmit={formik.handleSubmit}>
        {[
          { name: 'id', type: 'number', label: 'ID', disabled: isEditMode, readonly: true },
          { name: 'title', label: 'Title' },
          { name: 'description', label: 'Description' },
          { name: 'instructions', label: 'Instructions' }
        ].map(({ name, label, type = 'text', disabled = false }) => (
          <div className="mb-3" key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              id={name}
              name={name}
              type={type}
              disabled={disabled}
              className={`form-control ${formik.touched[name] && formik.errors[name] ? 'is-invalid' : ''}`}
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched[name] && formik.errors[name] ? (
              <div className="invalid-feedback">{formik.errors[name]}</div>
            ) : null}
          </div>
        ))}

        <button type="submit" className="btn btn-primary">
          {isEditMode ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default TestForm;
