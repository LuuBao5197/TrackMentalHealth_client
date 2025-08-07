import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Card, Button, Form as BootstrapForm } from 'react-bootstrap';
import CKEditorComponent from '../../utils/ckeditor/CkEditorComponent';
import CkeditorPreview from '../../utils/ckeditor/CkEditorPreview';

const questionTypes = [
    { value: 'MULTI_CHOICE', label: 'Multiple Choice (many correct)' },
    { value: 'SINGLE_CHOICE', label: 'Single Choice (one correct)' },
    { value: 'TEXT_INPUT', label: 'Text Input (user must type answer)' },
    { value: 'SCORE_BASED', label: 'Score Based (each option has a point)' },
    { value: 'MATCHING', label: 'MATCHING (no option but have left and right item)' },
];

const difficulty = [
    { value: 'EASY', label: 'EASY QUESTION' },
    { value: 'MEDIUM', label: 'MEDIUM QUESTION' },
    { value: 'HARD', label: 'HARD QUESTION' }

]

const CreateQuestionForm = () => {
    const [topic, setTopic] = useState(null);
    const [preview, setPreview] = useState(null);

    const validationSchema = Yup.object({
        content: Yup.string().required('Question content is required'),
        type: Yup.string().required('Please select question type'),
        topicID: Yup.string().required('Please select question topic'),
        difficulty: Yup.string().required("Please select question difficulity"),
        matchingItems: Yup.array()
            .when('type', {
                is: 'MATCHING',
                then: (schema) =>
                    schema
                        .min(1, 'At least one matching pair is required')
                        .of(
                            Yup.object({
                                leftItem: Yup.string().required('Left item is required'),
                                rightItem: Yup.string().required('Right item is required'),
                            })
                        )
                        .test(
                            "left-right-unique",
                            "Các giá trị bên trái và bên phải phải khác nhau và không được trùng lặp.",
                            (matchItem) => {
                                if (!Array.isArray(matchItem)) return false;

                                const lefts = matchItem.map((l) => l.leftItem.trim().toLowerCase());
                                const rights = matchItem.map((l) => l.rightItem.trim().toLowerCase());

                                const uniqueLeft = new Set(lefts);
                                const uniqueRight = new Set(rights);

                                const leftRightPairsAreValid = matchItem.every(
                                    (item) =>
                                        item.leftItem.trim().toLowerCase() !==
                                        item.rightItem.trim().toLowerCase()
                                );

                                const noOverlap = !lefts.some((left) => rights.includes(left));

                                const allLeftUnique = uniqueLeft.size === lefts.length;
                                const allRightUnique = uniqueRight.size === rights.length;

                                return (
                                    leftRightPairsAreValid && noOverlap && allLeftUnique && allRightUnique
                                );
                            }
                        )

            }),
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
                                opts?.some((opt) => opt.correct === true) && uniqueContents.size === opts.length

                            )

                        }
                        ),
            })

    });

    const fetchTopic = async () => {
        const data = await axios.get("http://localhost:9999/api/topic");
        console.log(data)
        setTopic(data.data);
    }
    useEffect(() => {
        fetchTopic();
    }, [])


    return (
        <div className="container mt-4">
            <h3>Create a Question</h3>
            <Formik
                initialValues={{
                    content: '',
                    type: '',
                    difficulty: '',
                    topicID: '',
                    options: [],
                    matchingItems: [],

                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                    console.log(values);
                    try {
                        // await axios.post('http://localhost:9999/api/questions', values);
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
                        {/* <div className="mb-3">
                            <label>Question Content</label>
                            <Field name="content" className="form-control" />
                            <ErrorMessage
                                name="content"
                                component="div"
                                className="text-danger"
                            />
                            
                        </div> */}
                        <Field
                            name="content"
                            component={CKEditorComponent}
                            label="Question content"
                            placeholder="Content of Question"
                        />

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

                        <div className="mb-3">
                            <label>Question Topic</label>
                            <Field
                                as="select"
                                name="topicID"
                                className="form-select"
                                onChange={(e) => {
                                    const topicID = e.target.value;
                                    setFieldValue('topicID', topicID);
                                }}
                            >
                                <option value="">Select topic</option>
                                {topic && topic.map((q) => (
                                    <option key={q.id} value={q.id}>
                                        {q.name}
                                    </option>
                                ))}
                            </Field>
                            <ErrorMessage
                                name="topicID"
                                component="div"
                                className="text-danger"
                            />
                        </div>

                        <div className="mb-3">
                            <label>Question difficulty</label>
                            <Field
                                as="select"
                                name="difficulty"
                                className="form-select"
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFieldValue('difficulty', newType);
                                }}
                            >
                                <option value="">Select difficulty</option>
                                {difficulty.map((q) => (
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
                        {values.type !== 'SCORE_BASED' &&
                            <div className="mb-3">
                                <label>Question Score</label>
                                <Field name="score" type="number" className="form-control" />
                                <ErrorMessage
                                    name="score"
                                    component="div"
                                    className="text-danger"
                                />
                            </div>}


                        {values.type !== 'MATCHING' &&
                            <FieldArray name="options">
                                {({ push, remove }) => (
                                    <div className="mb-3">
                                        {values.type !== 'TEXT_INPUT' && (
                                            <Button
                                                type="button"
                                                className="mb-2"
                                                onClick={() => {
                                                    const base = { content: '', score: 0 };
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
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                `options[${index}].correct`,
                                                                e.target.checked
                                                            )
                                                            if (e.target.checked) {
                                                                setFieldValue(`options[${index}].score`, 1);
                                                            } else {
                                                                setFieldValue(`options[${index}].score`, 0)
                                                            }

                                                        }
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
                                                            values.options.forEach((_, i) => {
                                                                setFieldValue(`options[${i}].correct`, false);
                                                                setFieldValue(`options[${i}].score`, 0); // 
                                                            }
                                                            );
                                                            setFieldValue(`options[${index}].correct`, true);
                                                            setFieldValue(`options[${index}].score`, 1); // ✅ set điểm cho đáp án được chọn
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
                        }

                        {values.type === 'MATCHING' && (
                            <FieldArray name="matchingItems">
                                {({ push, remove }) => (
                                    <div className="mb-3">
                                        <Button
                                            type="button"
                                            className="mb-2"
                                            onClick={() =>
                                                push({ leftItem: '', rightItem: '' })
                                            }
                                        >
                                            Add Matching Pair
                                        </Button>

                                        {values.matchingItems?.map((pair, index) => (
                                            <Card key={index} className="mb-2 p-3">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label>Left Item</label>
                                                        <Field
                                                            name={`matchingItems[${index}].leftItem`}
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage
                                                            name={`matchingItems[${index}].leftItem`}
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label>Right Item</label>
                                                        <Field
                                                            name={`matchingItems[${index}].rightItem`}
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage
                                                            name={`matchingItems[${index}].rightItem`}
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Card>
                                        ))}

                                        {touched.matchingItems && typeof errors.matchingItems === 'string' && (
                                            <div className="text-danger">{errors.matchingItems}</div>
                                        )}
                                    </div>
                                )}
                            </FieldArray>
                        )}



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

                        {preview && values.type !== "MATCHING" && (

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

                        {preview && values.type === 'MATCHING' && (
                            <Card className="mt-4 p-3">
                                <h5>Preview</h5>
                                <p>
                                    <strong>Question:</strong> <CkeditorPreview htmlContent={preview.content} />
                                </p>
                                <ul>
                                    {/* {console.log(preview)} */}
                                    {preview.matchingItems.map((pair, idx) => (
                                        <li key={idx}>
                                            {pair.leftItem} ⟶ {pair.rightItem}
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
