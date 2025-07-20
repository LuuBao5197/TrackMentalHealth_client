import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

const PAGE_SIZE = 5;

const TestQuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [initialValues, setInitialValues] = useState({
    testId: '',
    testName: '',
    questionText: '',
    questionType: '',
    questionOrder: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [testList, setTestList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load câu hỏi khi ở chế độ edit
  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:9999/api/test/question/${id}`)
        .then(response => {
          const q = response.data;
          setInitialValues({
            testId: q.test?.id || '',
            testName: q.test?.title || '',
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
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      testName: Yup.string(),
      testId: Yup.number(),
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
        navigate('/questions');
      } catch (error) {
        console.error('Lỗi khi lưu:', error);
        alert('Không thể lưu câu hỏi!');
      }
    }
  });

  // Tải danh sách test có phân trang + tìm kiếm
  const fetchTests = async (page = 1, search = '') => {
    try {
      const res = await axios.get(`http://localhost:9999/api/test/`, {
        params: { page, size: PAGE_SIZE, search }
      });
      setTestList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách bài test');
    }
  };

  // Mở modal và gọi API
  const handleOpenModal = () => {
    setShowModal(true);
    fetchTests(1, searchTerm);
  };

  const handleSelectTest = (test) => {
    formik.setFieldValue('testId', test.id);
    formik.setFieldValue('testName', test.title);
    setShowModal(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchTests(1, value);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchTests(currentPage - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTests(currentPage + 1, searchTerm);
    }
  };

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? 'Edit' : 'Create'} Test Question</h3>
      <form onSubmit={formik.handleSubmit} className="row g-3">

        <div className="col-md-6">
          <label className="form-label">Test</label>
          <div className="input-group">
            <input
              type="text"
              readOnly
              value={formik.values.testName}
              className={`form-control ${formik.touched.testName && formik.errors.testName ? 'is-invalid' : ''}`}
            />
            <input
              type="hidden"
              readOnly
              value={formik.values.testId}
              className={`form-control ${formik.touched.testId && formik.errors.testId ? 'is-invalid' : ''}`}
            />
            <button type="button" className="btn btn-outline-secondary" onClick={handleOpenModal}>
              Chọn bài Test
            </button>
          </div>
          {formik.touched.testId && formik.errors.testId && (
            <div className="invalid-feedback d-block">{formik.errors.testId}</div>
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

      {/* Modal chọn bài Test */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn bài Test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ul className="list-group">
            {testList.map(test => (
              <li
                key={test.id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectTest(test)}
                style={{ cursor: 'pointer' }}
              >
                {test.title} (ID: {test.id})
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button variant="secondary" onClick={handlePrevPage} disabled={currentPage === 1}>← Trước</Button>{' '}
            <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>Sau →</Button>
          </div>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestQuestionForm;
