import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { showAlert } from '../../utils/showAlert';

const PAGE_SIZE = 5;

const TestResultForm = () => {
    const [showModal, setShowModal] = useState(false);
    const [testList, setTestList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryList, setCategoryList] = useState([]);

    const fetchTests = async (page = 1, search = '') => {
        try {
            const res = await axios.get('http://localhost:9999/api/test/', {
                params: { page, size: PAGE_SIZE, search }
            });
            setTestList(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(res.data.currentPage || 1);
        } catch (err) {
            showAlert('Unable to load test list' + err, 'Error');
        }
    };

    const validationSchema = Yup.object({
        testId: Yup.number().required('Please select a test'),
        results: Yup.array().of(
            Yup.object().shape({
                scoreFrom: Yup.number()
                    .required('Required')
                    .min(0, 'Score must be >= 0'),
                scoreTo: Yup.number()
                    .required('Required')
                    .test('greater-than-from', '"To" must be >= "From"', function (value) {
                        const { scoreFrom } = this.parent;
                        return value >= scoreFrom;
                    })
                    .test('max-score-by-category', 'Score exceeds max of category', function (value) {
                        const { category } = this.parent;
                        if (!category) return true; // global result không cần kiểm tra
                        const found = categoryList.find((opt) => Object.keys(opt)[0] === category);
                        if (!found) return true; // category không tồn tại thì bỏ qua
                        const max = Object.values(found)[0];
                        return value <= max;
                    }),
                category: Yup.string().required('Category is require'), // global thì null, category thì string
                description: Yup.string().required('Required')
            })
        )
    });


    const formik = useFormik({
        initialValues: {
            testId: '',
            testName: '',
            results: [{ scoreFrom: '', scoreTo: '', category: null, description: '' }]
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
                            category: true
                        })),
                    },
                    false
                );
                return;
            }

            // Nhóm results theo category
            const resultsByCategory = values.results.reduce((acc, r) => {
                const key = r.category || '__global__';
                if (!acc[key]) acc[key] = [];
                acc[key].push(r);
                return acc;
            }, {});

            for (const [category, records] of Object.entries(resultsByCategory)) {
                const sorted = [...records].sort((a, b) => a.scoreFrom - b.scoreFrom);

                // Lấy maxScore category
                let maxScoreCat = null;
                if (category !== '__global__') {
                    const found = categoryList.find(opt => Object.keys(opt)[0] === category);
                    maxScoreCat = found ? Object.values(found)[0] : null;
                } else {
                    // Nếu global, dùng maxScore tổng (có thể set trước khi chọn test)
                    maxScoreCat = Math.max(...values.results.map(r => r.scoreTo || 0));
                }

                for (let i = 0; i < sorted.length; i++) {
                    const { scoreFrom, scoreTo } = sorted[i];

                    // Bắt đầu từ 0
                    if (i === 0 && scoreFrom !== 0) {
                        showAlert(
                            `Score ranges in category "${category === '__global__' ? 'Global' : category}" must start from 0`
                        , 'Error');
                        return;
                    }

                    // Kết thúc bằng maxScore
                    if (i === sorted.length - 1 && scoreTo !== maxScoreCat) {
                        showAlert(
                            `Score ranges in category "${category === '__global__' ? 'Global' : category}" must end at ${maxScoreCat}`,'Error'
                        );
                        return;
                    }

                    // Kiểm tra tính liên tục
                    if (i > 0) {
                        const prevTo = sorted[i - 1].scoreTo;
                        if (scoreFrom !== prevTo + 1) {
                            showAlert(
                                `Score ranges in category "${category === '__global__' ? 'Global' : category}" must be continuous (should start from ${prevTo + 1})`,'Error'
                            );
                            return;
                        }
                    }

                    // Kiểm tra scoreTo không vượt maxScore category
                    if (maxScoreCat !== null && scoreTo > maxScoreCat) {
                        showAlert(
                            `Score "To" of category "${category === '__global__' ? 'Global' : category}" cannot exceed maxScore (${maxScoreCat})`, 'Error'
                        );
                        return;
                    }
                }
            }

            try {
                const payload = values.results.map((r) => ({
                    minScore: r.scoreFrom,
                    maxScore: r.scoreTo,
                    category: r.category ?? null,
                    resultText: r.description,
                    test: { id: values.testId }
                }));
                await axios.post('http://localhost:9999/api/test/multiTestResult', payload);
                showAlert('Test results created successfully', 'success');
            } catch (err) {
                showAlert(`Failed to create test results: ${err}`, 'Error');
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
            const res1 = await axios.get(`http://localhost:9999/api/test/${test.id}/getCategoriesOfTest`)
            console.log(res1)
            setCategoryList(res1.data);
        } catch (err) {
            setCategoryList(null);
        }
    };

    return (
        <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="container mt-1">
                <h4>Score Scale Setup</h4>

                <Form.Group className="mb-3 mt-3">
                    <div className="input-group w-50">
                        <Form.Control
                            readOnly
                            value={values.testName}
                            placeholder="Select a test"
                            isInvalid={!!(touched.testId && errors.testId)}
                        />
                        <Button variant="outline-secondary" onClick={handleOpenModal}>Select</Button>
                    </div>
                    {touched.testId && errors.testId && (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                            {errors.testId}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {/* Chỉ hiển thị khi đã chọn test */}
                {values.testId && categoryList.length > 0 && (
                    <>
                        <FieldArray name="results">
                            {({ push, remove }) => (
                                <>
                                    {values.results.map((result, index) => (
                                        <Row key={index} className="mb-2 align-items-center mx-auto">
                                            <Col md={2}>
                                                <Form.Control
                                                    type="number"
                                                    name={`results[${index}].scoreFrom`}
                                                    placeholder="From"
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
                                                    placeholder="To"
                                                    value={result.scoreTo}
                                                    onChange={handleChange}
                                                    isInvalid={!!(errors.results?.[index]?.scoreTo && touched.results?.[index]?.scoreTo)}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.results?.[index]?.scoreTo}
                                                </Form.Control.Feedback>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Select
                                                    name={`results[${index}].category`}
                                                    value={result.category || ''}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select category</option>
                                                    {categoryList.map((opt, idx) => {
                                                        const [key, value] = Object.entries(opt)[0];
                                                        return (
                                                            <option key={idx} value={key}>
                                                                {key} (maxScore: {value})
                                                            </option>
                                                        );
                                                    })}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                                                    {errors.results?.[index]?.category}
                                                </Form.Control.Feedback>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Control
                                                    type="text"
                                                    name={`results[${index}].description`}
                                                    placeholder="Result description & suggestions"
                                                    value={result.description}
                                                    onChange={handleChange}
                                                    isInvalid={!!(errors.results?.[index]?.description && touched.results?.[index]?.description)}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.results?.[index]?.description}
                                                </Form.Control.Feedback>
                                            </Col>
                                            <Col md={2}>
                                                <Button variant="danger" onClick={() => remove(index)}>Delete</Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button
                                        variant="secondary"
                                        className="mt-2"
                                        onClick={() => {
                                            const last = values.results[values.results.length - 1];
                                            const newScoreFrom = last?.scoreTo !== '' && !isNaN(last?.scoreTo) ? Number(last.scoreTo) + 1 : '';
                                            push({ scoreFrom: newScoreFrom, scoreTo: '', category: '', description: '' });
                                        }}
                                    >
                                        Add Result
                                    </Button>
                                </>
                            )}
                        </FieldArray>

                        <Button type="submit" className="mt-2 mx-3">Save</Button>
                    </>
                )}

            </Form>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Select a Test</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchTests(1, e.target.value);
                        }}
                    />
                    <ul className="list-group">
                        {testList.filter(test => test.hasResult === false).map(test => (
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
                            ← Previous
                        </Button>{' '}
                        <Button variant="secondary" onClick={() => fetchTests(currentPage + 1, searchTerm)} disabled={currentPage === totalPages}>
                            Next →
                        </Button>
                    </div>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </FormikProvider>
    );
};

export default TestResultForm;
