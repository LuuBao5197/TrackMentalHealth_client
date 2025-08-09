import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css';
import CKEditorComponent from '../../utils/ckeditor/CkEditorComponent'
const questionTypes = [
    { value: '', label: 'All Types' },
    { value: 'MULTI_CHOICE', label: 'Multiple Choice' },
    { value: 'TEXT_INPUT', label: 'Text Input' },
    { value: 'NUMBER_INPUT', label: 'Number Input' },
    { value: 'SCORE_BASED', label: 'Score Based' }
];

const QuizForm = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [topics, setTopics] = useState([]);
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        topicId: '',
        type: '',
        page: 0
    });
    const [pagination, setPagination] = useState({ totalPages: 1 });

    useEffect(() => {
        loadQuestions();
        loadTopics();
    }, [searchParams]);

    const loadQuestions = async () => {
        const res = await axios.get('http://localhost:9999/api/questions', {
            params: {
                keyword: searchParams.keyword,
                topicId: searchParams.topicId,
                type: searchParams.type,
                page: searchParams.page,
                size: 4
            }
        });
        setQuestions(res.data.content);
        setPagination({ totalPages: res.data.totalPages });
    };

    const loadTopics = async () => {
        const res = await axios.get('http://localhost:9999/api/topic');
        setTopics(res.data);
    };
    const toggleQuestion = (id, setFieldValue) => {
        setSelectedQuestions((prev) => {
            const newSelection = prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id];
            setFieldValue('selectedQuestionIds', newSelection);
            return newSelection;
        });
    };


    const schema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        timeLimit: Yup.number().min(1, 'Minimum 1 minute').required('Time is required'),
        description: Yup.string().required('Description is required'),
        numberOfQuestions: Yup.number()
            .required('Required')
            .min(1, 'At least 1 question')
            .test(
                'max-questions',
                'Must be less than or equal to the number of selected questions',
                function (value) {
                    const { selectedQuestionIds } = this.parent;
                    return (!selectedQuestionIds) || value <= selectedQuestionIds.length;
                }
            )
    });

    return (
        <div className="container mt-4">
            {/* {console.log(questions)} */}
            <h3>Create New Quiz</h3>
            <Formik
                initialValues={{ title: '', timeLimit: '', description: '', numberOfQuestions: 0, selectedQuestionIds: [] }}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                    const payload = {
                        title: values.title,
                        timeLimit: values.timeLimit,
                        description: values.description,
                        questionIds: selectedQuestions,
                        numberOfQuestions: values.numberOfQuestions
                    };

                    try {
                        const res = await axios.post('http://localhost:9999/api/quizzes', payload);
                        alert('Quiz created successfully!');
                        // Reset or redirect here if needed
                    } catch (error) {
                        console.error('Error creating quiz:', error.response || error);
                        alert('Failed to create quiz.');
                    } finally {
                        setSubmitting(false);
                    }
                }}

            >
                {({ handleChange, handleSubmit, setFieldValue }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Quiz Title</label>
                            <Field name="title" className="form-control" />
                            <ErrorMessage name="title" component="div" className="text-danger" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Time Limit (minutes)</label>
                            <Field name="timeLimit" type="number" className="form-control" />
                            <ErrorMessage name="timeLimit" component="div" className="text-danger" />
                        </div>
                        {/* <div className="mb-3">
                            <label className="form-label">Description</label>
                            <Field name="description" className="form-control" component />
                            <ErrorMessage name="description" component="div" className="text-danger" />
                        </div> */}
                        <Field
                            name="description"
                            component={CKEditorComponent}
                            label="Giới thiệu ngắn"
                            placeholder="Viết giới thiệu ngắn..."
                        />
                        <div className="mb-3">
                            <label className="form-label">Number of Questions to Show</label>
                            <Field name="numberOfQuestions" type="number" className="form-control" />
                            <ErrorMessage name="numberOfQuestions" component="div" className="text-danger" />
                        </div>


                        {/* FILTERS */}
                        <div className="border rounded p-3 mb-3">
                            <h5>Filter Questions</h5>
                            <div className="row mb-2">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search keyword..."
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({ ...prev, keyword: e.target.value, page: 0 }))
                                        }
                                    />
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({ ...prev, topicId: e.target.value || '', page: 0 }))
                                        }
                                    >
                                        <option value="">All Topics</option>
                                        {topics.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        onChange={(e) =>
                                            setSearchParams((prev) => ({ ...prev, type: e.target.value, page: 0 }))
                                        }
                                    >
                                        {questionTypes.map((qt) => (
                                            <option key={qt.value} value={qt.value}>
                                                {qt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* QUESTIONS LIST */}
                        <div className="mb-3">
                            <h5>Select Questions</h5>
                            {questions.map((q) => (
                                <div className="form-check" key={q.id}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedQuestions.includes(q.id)}
                                        onChange={() => toggleQuestion(q.id, setFieldValue)}
                                    />
                                    <label className="form-check-label">
                                        {q.content} ({q.topicName}) - {q.type}
                                    </label>
                                </div>
                            ))}
                            {/* PAGINATION */}
                            <nav>
                                <ul className="pagination mt-3">
                                    {[...Array(pagination.totalPages).keys()].map((num) => (
                                        <li
                                            key={num}
                                            className={`page-item ${searchParams.page === num ? 'active' : ''}`}
                                        >
                                            <button
                                                type="button"
                                                className="page-link"
                                                onClick={() =>
                                                    setSearchParams((prev) => ({ ...prev, page: num }))
                                                }
                                            >
                                                {num + 1}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>

                        {/* SUBMIT */}
                        <button type="submit" className="btn btn-primary">
                            Create Test
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default QuizForm;
