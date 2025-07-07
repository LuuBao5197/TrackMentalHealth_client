import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TestQuestionForm = () => {
  const { id } = useParams(); // nếu có thì là edit
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [initialValues, setInitialValues] = useState({
    testId: '',
    questionText: '',
    questionType: '',
    questionOrder: ''
  });

  // Load dữ liệu nếu là edit
  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:9999/api/test/question/${id}`)
        .then(response => {
          const q = response.data;
          setInitialValues({
            testId: q.test?.id || '',
            questionText: q.questionText || '',
            questionType: q.questionType || '',
            questionOrder: q.questionOrder || ''
          });
        })
        .catch(error => {
          console.error('Failed to load question:', error);
          alert('Không thể tải dữ liệu câu hỏi');
        });
    }
  }, [id]);

  const formik = useFormik({
    enableReinitialize: true, // rất quan trọng khi có dữ liệu từ useEffect
    initialValues,
    validationSchema: Yup.object({
      testId: Yup.number().required('Test ID is required'),
      questionText: Yup.string().required('Question text is required'),
      questionType: Yup.string().required('Question type is required'),
      questionOrder: Yup.number().required('Question order is required'),
    }),
    onSubmit: async (values) => {
      const payload = {
        test: { id: values.testId },
        questionText: values.questionText,
        questionType: values.questionType,
        questionOrder: values.questionOrder
      };

      try {
        if (isEditMode) {
          await axios.put(`http://localhost:9999/api/test/question/${id}`, payload);
          alert('Cập nhật câu hỏi thành công!');
        } else {
          await axios.post('http://localhost:9999/api/test/question', payload);
          alert('Tạo câu hỏi mới thành công!');
        }
        navigate('/questions'); // hoặc về trang danh sách câu hỏi
      } catch (error) {
        console.error('Lỗi khi lưu:', error);
        alert('Không thể lưu câu hỏi!');
      }
    }
  });

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? 'Edit' : 'Create'} Test Question</h3>
      <form onSubmit={formik.handleSubmit} className="row g-3">

        <div className="col-md-6">
          <label htmlFor="testId" className="form-label">Test ID</label>
          <input
            type="number"
            id="testId"
            name="testId"
            className={`form-control ${formik.touched.testId && formik.errors.testId ? 'is-invalid' : ''}`}
            value={formik.values.testId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.testId && formik.errors.testId && (
            <div className="invalid-feedback">{formik.errors.testId}</div>
          )}
        </div>

        <div className="col-md-12">
          <label htmlFor="questionText" className="form-label">Question Text</label>
          <input
            type="text"
            id="questionText"
            name="questionText"
            className={`form-control ${formik.touched.questionText && formik.errors.questionText ? 'is-invalid' : ''}`}
            value={formik.values.questionText}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.questionText && formik.errors.questionText && (
            <div className="invalid-feedback">{formik.errors.questionText}</div>
          )}
        </div>

        <div className="col-md-6">
          <label htmlFor="questionType" className="form-label">Question Type</label>
          <input
            type="text"
            id="questionType"
            name="questionType"
            className={`form-control ${formik.touched.questionType && formik.errors.questionType ? 'is-invalid' : ''}`}
            value={formik.values.questionType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.questionType && formik.errors.questionType && (
            <div className="invalid-feedback">{formik.errors.questionType}</div>
          )}
        </div>

        <div className="col-md-6">
          <label htmlFor="questionOrder" className="form-label">Question Order</label>
          <input
            type="number"
            id="questionOrder"
            name="questionOrder"
            className={`form-control ${formik.touched.questionOrder && formik.errors.questionOrder ? 'is-invalid' : ''}`}
            value={formik.values.questionOrder}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.questionOrder && formik.errors.questionOrder && (
            <div className="invalid-feedback">{formik.errors.questionOrder}</div>
          )}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestQuestionForm;
