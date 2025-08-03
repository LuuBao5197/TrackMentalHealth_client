import React, { useState } from 'react';
import { Formik, Field, Form, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Card, Button, Form as BootstrapForm } from 'react-bootstrap';

const questionTypes = [
    { value: 'MULTI_CHOICE', label: 'Multiple Choice (many correct)' },
    { value: 'SINGLE_CHOICE', label: 'Single Choice (one correct)' },
    { value: 'TEXT_INPUT', label: 'Text Input (user must type answer)' },
    { value: 'SCORE_BASED', label: 'Score Based (each option has a point)' },
];

const CreateQuestionForm = () => {
    const [preview, setPreview] = useState(null);

    const validationSchema = Yup.object({
        content: Yup.string().required('Question content is required'),
        type: Yup.string().required('Please select question type'),
        options: Yup.array()
            .when('type', {
                is: 'TEXT_INPUT',
                then: (schema) =>
                    schema.length(1).of(
                        Yup.object({
                            content: Yup.string().required('Answer is required'),
                            correct: Yup.boolean().oneOf([true], 'Must be marked correct'),
                        })
                    ),
            })
            .when('type', {
                is: 'SCORE_BASED',
                then: (schema) =>
                    schema
                        .min(2, 'At least two options required')
                        .of(
                            Yup.object({
                                content: Yup.string().required('Option content required'),
                                score: Yup.number()
                                    .required('Score is required')
                                    .min(0, 'Score must be at least 0'),
                            })
                        )
                        .test('unique-score-and-content', 'Scores must be unique and in range 0 to n-1 and option content must be unique', (opts) => {
                            const scores = opts.map((opt) => opt.score);
                            const contents = opts.map((opt) => opt.content.trim().toLocaleLowerCase())
                            const uniqueScores = new Set(scores);
                            const uniqueContents = new Set(contents);
                            return (
                                scores.every((s) => Number.isInteger(s) && s >= 0 && s < opts.length) &&
                                uniqueScores.size === opts.length && uniqueContents.size === opts.length
                            );
                        }),
            })
            .when('type', {
                is: (val) => val === 'MULTI_CHOICE' || val === 'SINGLE_CHOICE',
                then: (schema) =>
                    schema
                        .min(1, 'At least one option is required')
                        .of(
                            Yup.object({
                                content: Yup.string().required('Option content is required'),
                                correct: Yup.boolean(),
                            })
                        )
                        .test('has-correct and unique_content', 'At least one correct answer is required and Option content must be unique', (opts) => {
                            const contents = opts.map((opt) => opt.content.trim().toLocaleLowerCase());
                            const uniqueContents = new Set(contents);
                            return (
                                opts?.some((opt) => opt.correct === true) && uniqueContents.size === OpacitySharp.length

                            )

                        }
                        ),
            }),
    });

    return (
        <div className="container mt-4">
            <h3>Create a Question</h3>
            <Formik
                initialValues={{
                    content: '',
                    type: '',
                    options: [],
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        await axios.post('http://localhost:9999/api/questions', values);
                        alert('Question created successfully');
                        resetForm();
                        setPreview(null);
                    } catch (err) {
                        alert('Error creating question');
                    }
                }}
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form>
                        <div className="mb-3">
                            <label>Question Content</label>
                            <Field name="content" className="form-control" />
                            <ErrorMessage
                                name="content"
                                component="div"
                                className="text-danger"
                            />
                        </div>

                        <div className="mb-3">
                            <label>Question Type</label>
                            <Field
                                as="select"
                                name="type"
                                className="form-select"
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFieldValue('type', newType);
                                    if (newType === 'TEXT_INPUT') {
                                        setFieldValue('options', [{ content: '', correct: true }]);
                                    } else {
                                        setFieldValue('options', []);
                                    }
                                }}
                            >
                                <option value="">Select type</option>
                                {questionTypes.map((q) => (
                                    <option key={q.value} value={q.value}>
                                        {q.label}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage
                                name="type"
                                component="div"
                                className="text-danger"
                            />
                        </div>

                        <FieldArray name="options">
                            {({ push, remove }) => (
                                <div className="mb-3">
                                    {values.type !== 'TEXT_INPUT' && (
                                        <Button
                                            type="button"
                                            className="mb-2"
                                            onClick={() => {
                                                const base = { content: '' };
                                                if (values.type === 'SCORE_BASED') {
                                                    base.score = 0;
                                                } else {
                                                    base.correct = false;
                                                }
                                                push(base);
                                            }}
                                        >
                                            Add Option
                                        </Button>
                                    )}

                                    {values.options.map((opt, index) => (
                                        <Card key={index} className="mb-2 p-3">
                                            <div className="mb-2">
                                                <label>Option Content</label>
                                                <Field
                                                    name={`options[${index}].content`}
                                                    className="form-control"
                                                />
                                                <ErrorMessage
                                                    name={`options[${index}].content`}
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </div>

                                            {values.type === 'MULTI_CHOICE' && (
                                                <BootstrapForm.Check
                                                    type="checkbox"
                                                    label="Correct Answer"
                                                    checked={opt.correct}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            `options[${index}].correct`,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            )}

                                            {values.type === 'SINGLE_CHOICE' && (
                                                <BootstrapForm.Check
                                                    type="radio"
                                                    name="singleChoiceCorrect"
                                                    label="Correct Answer"
                                                    checked={opt.correct}
                                                    onChange={() => {
                                                        values.options.forEach((_, i) =>
                                                            setFieldValue(`options[${i}].correct`, false)
                                                        );
                                                        setFieldValue(`options[${index}].correct`, true);
                                                    }}
                                                />
                                            )}

                                            {values.type === 'SCORE_BASED' && (
                                                <div className="mt-2">
                                                    <label>Score (0 to {values.options.length - 1})</label>
                                                    <Field
                                                        type="number"
                                                        name={`options[${index}].score`}
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage
                                                        name={`options[${index}].score`}
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </div>
                                            )}

                                            {values.type !== 'TEXT_INPUT' && (
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Card>
                                    ))}

                                    {touched.options && typeof errors.options === 'string' && (
                                        <div className="text-danger">{errors.options}</div>
                                    )}
                                </div>
                            )}
                        </FieldArray>

                        <div className="d-flex gap-2">
                            <Button type="submit">Submit</Button>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => setPreview(values)}
                            >
                                Preview
                            </Button>
                        </div>

                        {preview && (
                            <Card className="mt-4 p-3">
                                <h5>Preview</h5>
                                <p>
                                    <strong>Question:</strong> {preview.content}
                                </p>
                                <ul>
                                    {preview.options.map((opt, idx) => (
                                        <li key={idx}>
                                            {opt.content}{' '}
                                            {values.type === 'SCORE_BASED'
                                                ? `→ Score: ${opt.score}`
                                                : opt.correct
                                                ? '✔ Correct'
                                                : ''}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateQuestionForm;
