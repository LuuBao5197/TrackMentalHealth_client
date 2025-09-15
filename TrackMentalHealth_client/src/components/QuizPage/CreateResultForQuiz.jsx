import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { showAlert } from '../../utils/showAlert';

const PAGE_SIZE = 5;

const QuizResultForm = () => {
    const [maxScore, setMaxScore] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [quizList, setQuizList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchQuizs = async (page = 1, search = '') => {
        try {
            const res = await axios.get('http://localhost:9999/api/quizzes', {
                params: { page, size: PAGE_SIZE, search }
            });
            console.log(res);
            setQuizList(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setCurrentPage(res.data.currentPage || 1);
        } catch (err) {
            alert('Cannot load quiz list');
        }
    };

    const validationSchema = Yup.object({
        quizId: Yup.number().required('Quiz selection is required'),
        results: Yup.array().of(
            Yup.object().shape({
                minScore: Yup.number().required('Required').min(0, 'Score must be >= 0').max(99, 'Score must be <= 99'),
                maxScore: Yup.number()
                    .required('Required').max(100, 'Score must be <= 100')
                    .test('greater-than-from', 'Max must be >= Min', function (value) {
                        const { minScore } = this.parent;
                        return value >= minScore;
                    }),
                resultLabel: Yup.string().required('Required')
            })
        )
    });

    const formik = useFormik({
        initialValues: {
            quizId: '',
            quizName: '',
            results: [{ minScore: '', maxScore: '', resultLabel: '' }]
        },
        validationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, formikHelpers) => {
            const errors = await formikHelpers.validateForm();
            if (Object.keys(errors).length > 0) {
                formikHelpers.setTouched(
                    {
                        quizId: true,
                        results: values.results.map(() => ({
                            minScore: true,
                            maxScore: true,
                            resultLabel: true,
                        })),
                    },
                    false
                );
                return;
            }

            const sorted = [...values.results].sort((a, b) => a.minScore - b.minScore);
            for (let i = 1; i < sorted.length; i++) {
                const prevTo = sorted[i - 1].maxScore;
                const currFrom = sorted[i].minScore;
                if (currFrom !== prevTo + 1) {
                    alert(`Score ranges must be continuous (should start from ${prevTo + 1})`);
                    return;
                }
            }

            try {
                const payload = values.results.map((r) => ({
                    minScore: r.minScore,
                    maxScore: r.maxScore,
                    resultLabel: r.resultLabel,
                    quiz: { id: values.quizId }
                }));
                console.log(payload);
                await axios.post('http://localhost:9999/api/quiz-results/multiQuizResult', payload);
                showAlert('Create quiz success', 'success');
            } catch (err) {
                showAlert(`Create quiz fail ${err}`, 'error');
            }
        }
    });

    const { values, handleChange, handleSubmit, setFieldValue, errors, touched } = formik;

    const handleOpenModal = () => {
        setShowModal(true);
        fetchQuizs(1, searchTerm);
    };

    const handleSelectQuiz = async (quiz) => {
        setFieldValue('quizId', quiz.id);
        setFieldValue('quizName', quiz.title);
        setShowModal(false);

    };

    return (
        <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="container mt-1">
                <h4>Set up Score Range (%)</h4>

                <Form.Group className="mb-3 mt-3">
                    <div className="input-group w-50">
                        <Form.Control
                            readOnly
                            value={values.quizName}
                            placeholder="Select a quiz"
                            isInvalid={!!(touched.quizId && errors.quizId)}
                        />
                        <Button variant="outline-secondary" onClick={handleOpenModal}>Select</Button>
                    </div>
                    {touched.quizId && errors.quizId && (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                            {errors.quizId}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {maxScore !== null && (
                    <div className="mb-3">
                        <strong>Max Score:</strong> {maxScore}
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
                                            name={`results[${index}].minScore`}
                                            placeholder="From"
                                            value={result.minScore}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.minScore && touched.results?.[index]?.minScore)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.minScore}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control
                                            type="number"
                                            name={`results[${index}].maxScore`}
                                            placeholder="To"
                                            value={result.maxScore}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.maxScore && touched.results?.[index]?.maxScore)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.maxScore}
                                        </Form.Control.Feedback>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Control
                                            type="text"
                                            name={`results[${index}].resultLabel`}
                                            placeholder="Result and suggestions"
                                            value={result.resultLabel}
                                            onChange={handleChange}
                                            isInvalid={!!(errors.results?.[index]?.resultLabel && touched.results?.[index]?.resultLabel)}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.results?.[index]?.resultLabel}
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
                                    const newScoreFrom = last?.maxScore !== '' && !isNaN(last?.maxScore) ? Number(last.maxScore) + 1 : '';
                                    push({ minScore: newScoreFrom, maxScore: '', resultLabel: '' });
                                }}
                            >
                                Add result
                            </Button>
                        </>
                    )}
                </FieldArray>

                <Button type="submit" className="mt-2 mx-3">Save</Button>
            </Form>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Select a Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchQuizs(1, e.target.value);
                        }}
                    />
                    <ul className="list-group">
                        {console.log(quizList)}
                        {quizList.filter(quiz => quiz.hasResults == true).map(quiz => (
                            <li
                                key={quiz.id}
                                className="list-group-item list-group-item-action"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSelectQuiz(quiz)}
                            >
                                {quiz.title}
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Button variant="secondary" onClick={() => fetchQuizs(currentPage - 1, searchTerm)} disabled={currentPage === 1}>
                            ← Previous
                        </Button>{' '}
                        <Button variant="secondary" onClick={() => fetchQuizs(currentPage + 1, searchTerm)} disabled={currentPage === totalPages}>
                            Next →
                        </Button>
                    </div>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </FormikProvider>
    );
};

export default QuizResultForm;
