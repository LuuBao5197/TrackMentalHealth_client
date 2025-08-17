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
            alert('Unable to load test list');
        }
    };

    const validationSchema = Yup.object({
        testId: Yup.number().required('Please select a test'),
        results: Yup.array().of(
            Yup.object().shape({
                scoreFrom: Yup.number().required('Required').min(0, 'Score must be >= 0'),
                scoreTo: Yup.number()
                    .required('Required')
                    .test('greater-than-from', '"To" must be >= "From"', function (value) {
                        const { scoreFrom } = this.parent;
                        return value >= scoreFrom;
                    }),
                category: Yup.string().required('Required'),
                description: Yup.string().required('Required')
            })
        )
    });

    const formik = useFormik({
        initialValues: {
            testId: '',
            testName: '',
            results: [{ scoreFrom: '', scoreTo: '', category: '', description: '' }]
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
                            category: true,
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
                    alert(`Score ranges must be continuous (should start from ${prevTo + 1})`);
                    return;
                }
            }

            try {
                const payload = values.results.map((r) => ({
                    minScore: r.scoreFrom,
                    maxScore: r.scoreTo,
                    category: r.category,
                    resultText: r.description,
                    test: { id: values.testId }
                }));
                await axios.post('http://localhost:9999/api/test/multiTestResult', payload);
                showAlert('Test results created successfully', 'success');
            } catch (err) {
                showAlert(`Failed to create test results: ${err}`, 'error');
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
            alert('Unable to get max score');
            setMaxScore(null);
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

                {maxScore !== null && (
                    <div className="mb-3">
                        <strong>Max score:</strong> {maxScore}
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
                                    <Col md={2}>
                                        <Form.Control
                                            type="text"
                                            name={`results[${index}].category`}
                                            placeholder="Category"
                                            value={result.category}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.category && touched.results?.[index]?.category)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.category}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={4}>
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
