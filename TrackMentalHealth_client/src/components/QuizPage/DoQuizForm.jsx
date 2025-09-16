import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/quiz.css';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DoQuizForm = () => {
    const userId = useSelector((state) => state.auth.user.userId);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timer, setTimer] = useState(0);
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [focusedQuestion, setFocusedQuestion] = useState(null);
    const questionRefs = useRef([]);

    // helper: Fisher–Yates shuffle
    const shuffleArray = (arr) => {
        const a = Array.isArray(arr) ? arr.slice() : [];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    useEffect(() => {
        fetchQuiz(quizId);
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [quizId]);

    useEffect(() => {
        if (!quiz || !Array.isArray(quiz.quizQuestions)) return;

        setAnswers(prev => {
            const next = { ...prev };
            quiz.quizQuestions.forEach(q => {
                if (q.type === 'ORDERING' && Array.isArray(q.orderingItems) && !next[q.id]) {
                    // lưu mảng id đã được xáo trộn
                    const ids = q.orderingItems.map(item => item.id);
                    next[q.id] = shuffleArray(ids);
                }
                if (q.type === 'MATCHING' && Array.isArray(q.matchingItems) && !next[q.id]) {
                    // với matchingItems, mình lưu mảng rightItem (hoặc id nếu backend có id riêng)
                    const rightItems = q.matchingItems.map(pair => pair.rightItem);
                    next[q.id] = shuffleArray(rightItems);
                }
            });
            return next;
        });
    }, [quiz]);


    const fetchQuiz = async (id) => {
        try {
            const res = await axios.get(`http://localhost:9999/api/quizzes/${id}`);
            const data = res.data || {};
            setQuiz({
                ...data,
                quizQuestions: Array.isArray(data.quizQuestions) ? data.quizQuestions : []
            });
        } catch (err) {
            console.error(err);
            alert('Quiz not found');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleAnswer = (questionId, optionId, type, checked = false, value = '') => {
        setAnswers(prev => {
            const current = { ...prev };
            switch (type) {
                case 'MULTI_CHOICE':
                    if (!Array.isArray(current[questionId])) current[questionId] = [];
                    if (checked) {
                        current[questionId] = [...current[questionId], optionId];
                    } else {
                        current[questionId] = current[questionId].filter(id => id !== optionId);
                    }
                    break;
                case 'TEXT_INPUT':
                    current[questionId] = value;
                    break;
                default: // SINGLE_CHOICE, SCORE_BASED
                    current[questionId] = optionId;
                    break;
            }
            return current;
        });
    };

    const toggleMarkReview = (id) => {
        setMarkedForReview(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const scrollToQuestion = (index) => {
        const el = questionRefs.current[index];
        if (el && quiz && Array.isArray(quiz.quizQuestions)) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setFocusedQuestion(quiz.quizQuestions[index]?.id || null);
            setTimeout(() => setFocusedQuestion(null), 1500);
        }
    };

    const handleDragEnd = (q, result) => {
        if (!result.destination) return;

        if (q.type === 'MATCHING') {
            // giữ nguyên code MATCHING bạn đang có
            const current = answers[q.id]
                ? [...answers[q.id]]
                : (Array.isArray(q.matchingItems) ? q.matchingItems.map(pair => pair.rightItem) : []);

            const [moved] = current.splice(result.source.index, 1);
            current.splice(result.destination.index, 0, moved);

            setAnswers(prev => ({ ...prev, [q.id]: current }));
        }

        if (q.type === 'ORDERING') {
            const current = answers[q.id]
                ? [...answers[q.id]]
                : (Array.isArray(q.orderingItems) ? q.orderingItems.map(item => item.id) : []);

            const [moved] = current.splice(result.source.index, 1);
            current.splice(result.destination.index, 0, moved);

            setAnswers(prev => ({ ...prev, [q.id]: current }));
        }
    };

    const handleSubmit = async () => {
        if (!quiz || !Array.isArray(quiz.quizQuestions)) return;

        // Kiểm tra câu chưa trả lời
        const unanswered = quiz.quizQuestions.filter(q => {
            const ans = answers[q.id];
            return (
                ans === undefined ||
                ans === '' ||
                (Array.isArray(ans) && ans.length === 0)
            );
        });

        if (unanswered.length > 0) {
            alert(`You still have ${unanswered.length} unanswered question(s).`);
            return;
        }

        // Build mảng answers khớp DTO Java
        const formattedAnswers = quiz.quizQuestions.map(q => {
            const value = answers[q.id];
            const answerDto = {
                questionId: q.id,
                userInput: null,
                selectedOptionIds: null,
                matchingPairs: null,
                orderingItems: null
            };

            if (q.type === 'TEXT_INPUT') {
                answerDto.userInput = value || '';
            }
            else if (q.type === 'MULTI_CHOICE') {
                answerDto.selectedOptionIds = Array.isArray(value) ? value : [];
            }
            else if (q.type === 'SINGLE_CHOICE' || q.type === 'SCORE_BASED') {
                answerDto.selectedOptionIds = value ? [value] : [];
            }
            else if (q.type === 'MATCHING') {
                // value = mảng rightItem string (theo thứ tự người dùng sắp xếp)
                answerDto.matchingPairs = q.matchingItems.map((pair, idx) => ({
                    leftText: pair.leftItem,
                    rightText: value[idx]
                }));
            }
            else if (q.type === 'ORDERING') {
                // value = mảng itemId (theo thứ tự người dùng sắp xếp)
                answerDto.orderingItems = value.map((id, idx) => {
                    const item = q.orderingItems.find(it => it.id === id);
                    return {
                        itemId: id,
                        text: item?.content || '',
                        userOrder: idx + 1
                    };
                });
            }

            return answerDto;
        });

        const payload = {
            quizId: quiz.id,
            userId,
            answers: formattedAnswers
        };
        console.log(payload)

        try {
            await axios.post('http://localhost:9999/api/quiz/submit', payload);
            alert('Quiz submitted successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Submission failed.');
        }
    };


    if (!quiz) return <div className="text-center mt-5">Loading quiz...</div>;

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col md={8}>
                    <h5 className="text-primary fw-bold mb-4">{quiz.title}</h5>
                    <p>{quiz.instructions}</p>

                    {Array.isArray(quiz.quizQuestions) && quiz.quizQuestions.length > 0 ? (
                        quiz.quizQuestions.map((q, idx) => (
                            <Card
                                key={q.id || idx}
                                className={`p-3 mb-3 ${focusedQuestion === q.id ? 'focus-highlight' : ''}`}
                                ref={el => (questionRefs.current[idx] = el)}
                            >
                                <div className="d-flex justify-content-between">
                                    <h6 className="fw-bold">Question {idx + 1}</h6>
                                    <div>
                                        <span className="mark-review" onClick={() => toggleMarkReview(q.id)}>
                                            Review later
                                            <span className={markedForReview.includes(q.id) ? 'mark-dot active' : 'mark-dot'}></span>
                                        </span>
                                    </div>
                                </div>
                                <p>{q.content}</p>

                                {q.type === 'TEXT_INPUT' && (
                                    <Form.Control
                                        type="text"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleAnswer(q.id, null, 'TEXT_INPUT', false, e.target.value)}
                                    />
                                )}

                                {(q.type === 'SINGLE_CHOICE' || q.type === 'SCORE_BASED') &&
                                    Array.isArray(q.options) &&
                                    q.options.map(opt => {
                                        return (
                                            <Form.Check
                                                type="radio"
                                                name={`q-${q.id}`}
                                                key={opt.id}
                                                id={`q-${q.id}-opt-${opt.id}`}
                                                label={opt.content}
                                                value={opt.content}
                                                checked={answers[q.id] === opt.id}
                                                onChange={() => handleAnswer(q.id, opt.id, q.type)}
                                            />
                                        )

                                    })}

                                {q.type === 'MULTI_CHOICE' &&
                                    Array.isArray(q.options) &&
                                    q.options.map(opt => {
                                        {console.log(opt)}
                                        return (
                                            <Form.Check
                                                type="checkbox"
                                                key={opt.id}
                                                id={`q-${q.id}-opt-${opt.id}`}
                                                label={opt.content}
                                                value={opt.content}
                                                checked={answers[q.id]?.includes(opt.id) || false}
                                                onChange={(e) => handleAnswer(q.id, opt.id, 'MULTI_CHOICE', e.target.checked)}
                                            />
                                        )
                                    }
                                    )}

                                {q.type === 'ORDERING' && Array.isArray(q.orderingItems) && (
                                    <DragDropContext onDragEnd={(result) => handleDragEnd(q, result)}>
                                        <Droppable droppableId={`order-${q.id}`}>
                                            {(droppableProvided) => (
                                                <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                                                    {
                                                        // build danh sách object theo thứ tự ids trong answers[q.id], fallback về orderingItems gốc
                                                        (answers[q.id]
                                                            ? answers[q.id].map(id => q.orderingItems.find(it => it.id === id)).filter(Boolean)
                                                            : q.orderingItems.slice()
                                                        ).map((item, index) => (
                                                            <Draggable key={item.id} draggableId={`order-${q.id}-item-${item.id}`} index={index}>
                                                                {(draggableProvided) => (
                                                                    <div
                                                                        ref={draggableProvided.innerRef}
                                                                        {...draggableProvided.draggableProps}
                                                                        {...draggableProvided.dragHandleProps}
                                                                        className="p-2 mb-1 border bg-light"
                                                                    >
                                                                        {item.content}
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))
                                                    }
                                                    {droppableProvided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                )}

                                {q.type === 'MATCHING' && Array.isArray(q.matchingItems) && (
                                    <div className="matching-container d-flex">
                                        {/* Cột bên trái: luôn đúng thứ tự leftItem */}
                                        <div className="left-column me-4">
                                            {q.matchingItems.map((pair, index) => (
                                                <div key={`left-${index}`} className="p-2 mb-1 border bg-light">
                                                    {pair.leftItem}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Cột bên phải: draggable để sắp xếp rightItem */}
                                        <DragDropContext onDragEnd={(result) => handleDragEnd(q, result)}>
                                            <Droppable droppableId={`match-${q.id}`}>
                                                {(droppableProvided) => (
                                                    <div
                                                        className="right-column"
                                                        ref={droppableProvided.innerRef}
                                                        {...droppableProvided.droppableProps}
                                                    >
                                                        {
                                                            (answers[q.id]
                                                                ? answers[q.id] // mảng rightItem string
                                                                : q.matchingItems.map(pair => pair.rightItem)
                                                            ).map((right, index) => (
                                                                <Draggable
                                                                    key={`match-${q.id}-right-${right}`}
                                                                    draggableId={`match-${q.id}-right-${right}`}
                                                                    index={index}
                                                                >
                                                                    {(draggableProvided) => (
                                                                        <div
                                                                            ref={draggableProvided.innerRef}
                                                                            {...draggableProvided.draggableProps}
                                                                            {...draggableProvided.dragHandleProps}
                                                                            className="p-2 mb-1 border bg-light"
                                                                        >
                                                                            {right}
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))
                                                        }
                                                        {droppableProvided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>
                                )}


                            </Card>
                        ))
                    ) : (
                        <div>No questions available.</div>
                    )}
                </Col>

                <Col md={4}>
                    <Card className="p-3 quiz-sidebar">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6>Answered</h6>
                                <h5 className="fw-bold">{Object.keys(answers).length}/{quiz.quizQuestions?.length || 0}</h5>
                            </div>
                            <div>
                                <h6>Time</h6>
                                <h5 className="text-primary">{formatTime(timer)}</h5>
                            </div>
                        </div>

                        <div className="sidebar-grid mt-3">
                            {Array.isArray(quiz.quizQuestions) &&
                                quiz.quizQuestions.map((q, index) => {
                                    let status = 'blank';
                                    const a = answers[q.id];
                                    if (a && (Array.isArray(a) ? a.length > 0 : a !== '')) status = 'done';
                                    if (markedForReview.includes(q.id)) status = 'review';
                                    return (
                                        <div
                                            key={q.id}
                                            className={`sidebar-dot ${status}`}
                                            onClick={() => scrollToQuestion(index)}
                                        >
                                            {q.questionOrder}
                                        </div>
                                    );
                                })}
                        </div>

                        <Button className="w-100 mt-4 bg-primary border-0 text-white fw-bold" onClick={handleSubmit}>
                            SUBMIT
                        </Button>

                        <div className="mt-3">
                            <div><span className="dot done"></span> Done</div>
                            <div><span className="dot blank"></span> Not done</div>
                            <div><span className="dot review"></span> Review later</div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DoQuizForm;
