import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const LessonCreate = () => {
  const [users, setUsers] = useState([]);

  // Gọi API để lấy danh sách user từ backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:9999/api/lesson/users'); // Đổi URL nếu cần
        setUsers(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: true,
      createdAt: '',
      updatedAt: '',
      createdById: ''
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Vui lòng nhập tiêu đề'),
      description: Yup.string().required('Vui lòng nhập mô tả'),
      status: Yup.boolean().required(),
      createdAt: Yup.string().required('Vui lòng chọn ngày tạo'),
      updatedAt: Yup.string().required('Vui lòng chọn ngày cập nhật'),
      createdById: Yup.number()
        .required('Vui lòng chọn người tạo')
        .typeError('Vui lòng chọn người tạo hợp lệ')
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        title: values.title,
        description: values.description,
        status: values.status,
        createdAt: new Date(values.createdAt).toISOString(),
        updatedAt: new Date(values.updatedAt).toISOString(),
        createdBy: { id: parseInt(values.createdById) }
      };

      console.log('Payload gửi đi:', payload);

      try {
        await axios.post('http://localhost:9999/api/lesson/', payload);
        alert('Tạo bài học thành công!');
        resetForm();
      } catch (error) {
        console.error('Lỗi khi tạo bài học:', error.response?.data || error.message);
        alert('Tạo bài học thất bại!');
      }
    }
  });

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px' }}>Tạo Bài Học</h2>
      <form onSubmit={formik.handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Tiêu đề:</label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {formik.touched.title && formik.errors.title && <div style={{ color: 'red' }}>{formik.errors.title}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {formik.touched.description && formik.errors.description && <div style={{ color: 'red' }}>{formik.errors.description}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Trạng thái:</label>
          <select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value={true}>Hoạt động</option>
            <option value={false}>Không hoạt động</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Ngày tạo:</label>
          <input
            type="datetime-local"
            name="createdAt"
            value={formik.values.createdAt}
            onChange={formik.handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {formik.touched.createdAt && formik.errors.createdAt && <div style={{ color: 'red' }}>{formik.errors.createdAt}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Ngày cập nhật:</label>
          <input
            type="datetime-local"
            name="updatedAt"
            value={formik.values.updatedAt}
            onChange={formik.handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {formik.touched.updatedAt && formik.errors.updatedAt && <div style={{ color: 'red' }}>{formik.errors.updatedAt}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label>Người tạo:</label>
            <select
                name="createdById"
                value={formik.values.createdById}
                onChange={formik.handleChange}
                style={{ width: '100%', padding: '8px' }}
            >
                <option value="">-- Chọn người tạo --</option>
                {users.map(user => (
                <option key={user.id} value={user.id}>
                    {user.username} 
                </option>
                ))}
            </select>
            {formik.touched.createdById && formik.errors.createdById && (
                <div style={{ color: 'red' }}>{formik.errors.createdById}</div>
            )}
            </div>


        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Tạo mới
        </button>
      </form>
    </div>
  );
};

export default LessonCreate;
