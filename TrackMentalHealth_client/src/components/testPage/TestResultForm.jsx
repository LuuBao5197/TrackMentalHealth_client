import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { showAlert } from '../../utils/showAlert';

const PAGE_SIZE = 5;

const TestResultForm = () => {
    const [maxScore, setMaxScore] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [testList, setTestList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTests = async (page = 1, search = '') => {
        try {
            const res = await axios.get('http://localhost:9999/api/test/', {
                params: { page, size: PAGE_SIZE, search }
            });
            setTestList(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(res.data.currentPage || 1);
        } catch (err) {
            alert('Không thể tải danh sách bài test');
        }
    };

    const validationSchema = Yup.object({
        testId: Yup.number().required('Bắt buộc chọn bài test'),
        results: Yup.array().of(
            Yup.object().shape({
                scoreFrom: Yup.number().required('Bắt buộc').min(0, 'Điểm phải >= 0'),
                scoreTo: Yup.number()
                    .required('Bắt buộc')
                    .test('greater-than-from', 'Đến phải >= Từ', function (value) {
                        const { scoreFrom } = this.parent;
                        return value >= scoreFrom;
                    }),
                description: Yup.string().required('Bắt buộc')
            })
        )
    });

    const formik = useFormik({
        initialValues: {
            testId: '',
            testName: '',
            results: [{ scoreFrom: '', scoreTo: '', description: '' }]
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, formikHelpers) => {
            const errors = await formikHelpers.validateForm();
            if (Object.keys(errors).length > 0) {
                formikHelpers.setTouched(
                    {
                        testId: true,
                        results: values.results.map(() => ({
                            scoreFrom: true,
                            scoreTo: true,
                            description: true,
                        })),
                    },
                    false
                );
                return;
            }

            const sorted = [...values.results].sort((a, b) => a.scoreFrom - b.scoreFrom);
            for (let i = 1; i < sorted.length; i++) {
                const prevTo = sorted[i - 1].scoreTo;
                const currFrom = sorted[i].scoreFrom;
                if (currFrom !== prevTo + 1) {
                    alert(`Khoảng điểm phải nối tiếp sau khoảng trước đó (bắt đầu từ ${prevTo + 1})`);
                    return;
                }
            }

            try {
                const payload = values.results.map((r) => ({
                    minScore: r.scoreFrom,
                    maxScore: r.scoreTo,
                    resultText: r.description,
                    test: { id: values.testId }
                }));
                await axios.post('http://localhost:9999/api/test/multiTestResult', payload);
                showAlert('Create test success', 'success');
            } catch (err) {
                  showAlert(`Create test fail ${err}`, 'error');
            }
        }
    });

    const { values, handleChange, handleSubmit, setFieldValue, errors, touched } = formik;

    const handleOpenModal = () => {
        setShowModal(true);
        fetchTests(1, searchTerm);
    };

    const handleSelectTest = async (test) => {
        setFieldValue('testId', test.id);
        setFieldValue('testName', test.title);
        setShowModal(false);

        try {
            const res = await axios.get(`http://localhost:9999/api/test/${test.id}/getMaxScore`);
            setMaxScore(Number(res.data) || 0);
        } catch (err) {
            alert('Không thể lấy điểm tối đa');
            setMaxScore(null);
        }
    };

    return (
        <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="container mt-1">
                <h4>Thiết lập Thang điểm</h4>

                <Form.Group className="mb-3 mt-3">
                    {/* <Form.Label>Bài Test</Form.Label> */}
                    <div className="input-group w-50">
                        <Form.Control
                            readOnly
                            value={values.testName}
                            placeholder="Chọn bài test"
                            isInvalid={!!(touched.testId && errors.testId)}
                        />
                        <Button variant="outline-secondary" onClick={handleOpenModal}>Chọn</Button>
                    </div>
                    {touched.testId && errors.testId && (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                            {errors.testId}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {maxScore !== null && (
                    <div className="mb-3">
                        <strong>Điểm tối đa:</strong> {maxScore}
                    </div>
                )}

                <FieldArray name="results">
                    {({ push, remove }) => (
                        <>
                            {values.results.map((result, index) => (
                                <Row key={index} className="mb-2 align-items-center mx-auto">
                                    <Col md={2}>
                                        <Form.Control
                                            type="number"
                                            name={`results[${index}].scoreFrom`}
                                            placeholder="Từ"
                                            value={result.scoreFrom}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.scoreFrom && touched.results?.[index]?.scoreFrom)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.scoreFrom}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control
                                            type="number"
                                            name={`results[${index}].scoreTo`}
                                            placeholder="Đến"
                                            value={result.scoreTo}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.scoreTo && touched.results?.[index]?.scoreTo)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.scoreTo}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Control
                                            type="text"
                                            name={`results[${index}].description`}
                                            placeholder="Kết quả và gợi ý giải pháp"
                                            value={result.description}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.description && touched.results?.[index]?.description)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.description}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2}>
                                        <Button variant="danger" onClick={() => remove(index)}>Xóa</Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button 
                                variant="secondary"
                                className="mt-2"
                                onClick={() => {
                                    const last = values.results[values.results.length - 1];
                                    const newScoreFrom = last?.scoreTo !== '' && !isNaN(last?.scoreTo) ? Number(last.scoreTo) + 1 : '';
                                    push({ scoreFrom: newScoreFrom, scoreTo: '', description: '' });
                                }}
                            >
                                Thêm kết quả
                            </Button>
                        </>
                    )}
                </FieldArray>

                <Button type="submit" className="mt-2 mx-3">Lưu</Button>
            </Form>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chọn bài Test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchTests(1, e.target.value);
                        }}
                    />
                    <ul className="list-group">
                        {console.log(testList)}
                        {testList.filter(test=>test.results.length == 0).map(test => (
                            <li
                                key={test.id}
                                className="list-group-item list-group-item-action"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectTest(test)}
                            >
                                {test.title}
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Button variant="secondary" onClick={() => fetchTests(currentPage - 1, searchTerm)} disabled={currentPage === 1}>
                            ← Trước
                        </Button>{' '}
                        <Button variant="secondary" onClick={() => fetchTests(currentPage + 1, searchTerm)} disabled={currentPage === totalPages}>
                            Sau →
                        </Button>
                    </div>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </FormikProvider>
    );
};

export default TestResultForm;
