import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/quiz.css';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DoQuizForm = () => {
    const userId = useSelector((state) => state.auth.user.userId);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timer, setTimer] = useState(0);
    const {quizId} = useParams();
    const navigate = useNavigate();
    const [focusedQuestion, setFocusedQuestion] = useState(null);
    const questionRefs = useRef([]);

    useEffect(() => {
        fetchQuiz(quizId);
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [quizId]);

    const fetchQuiz = async (id) => {
        try {
            const res = await axios.get(`http://localhost:9999/api/quizzes/${id}`);
            console.log(res);
            setQuiz(res.data);
        } catch (err) {
            alert('Không tìm thấy bài quiz');
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
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setFocusedQuestion(quiz.quizQuestions[index].id);
            setTimeout(() => setFocusedQuestion(null), 1500);
        }
    };

    const handleSubmit = async () => {
        const unanswered = quiz.quizQuestions.filter(q => {
            const ans = answers[q.id];
            return (
                ans === undefined || 
                ans === '' || 
                (Array.isArray(ans) && ans.length === 0)
            );
        });

        if (unanswered.length > 0) {
            alert(`Bạn còn ${unanswered.length} câu chưa làm.`);
            return;
        }

        let totalScore = 0;
        quiz.quizQuestions.forEach(q => {
            const ans = answers[q.id];
            if (q.type === 'SCORE_BASED' && !Array.isArray(ans)) {
                const selectedOption = q.options.find(opt => opt.id === ans);
                if (selectedOption) {
                    totalScore += selectedOption.scoreValue || 0;
                }
            }
        });

        let resultText = "Không xác định";
        if (quiz.results?.length > 0) {
            const found = quiz.results.find(r => totalScore >= r.minScore && totalScore <= r.maxScore);
            if (found) resultText = found.resultText;
        }

        const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
            questionId: parseInt(questionId),
            selectedOptionIds: Array.isArray(value) ? value : [value],
            userTextAnswer: typeof value === 'string' ? value : null
        }));

        const payload = {
            userId,
            quizId: quiz.id,
            answers: formattedAnswers,
            result: resultText
        };

        try {
            const res = await axios.post('http://localhost:9999/api/quiz/submitUserQuizResult', payload);
            alert(`Nộp bài thành công. Điểm: ${totalScore}. Kết quả: ${resultText}`);
            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error('Lỗi khi gửi kết quả:', error);
            alert('Nộp bài thất bại.');
        }
    };

    if (!quiz) return <div className="text-center mt-5">Đang tải bài quiz...</div>;

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col md={8}>
                    <h5 className="text-primary fw-bold mb-4">{quiz.title}</h5>
                    <p>{quiz.instructions}</p>

                    {quiz.quizQuestions.map((q, idx) => (
                        <Card
                            key={q.id}
                            className={`p-3 mb-3 ${focusedQuestion === q.id ? 'focus-highlight' : ''}`}
                            ref={el => (questionRefs.current[idx] = el)}
                        >
                            <div className="d-flex justify-content-between">
                                <h6 className="fw-bold">Câu {idx + 1}</h6>
                                <div>
                                    <span className="mark-review" onClick={() => toggleMarkReview(q.id)}>
                                        Lát kiểm tra lại
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
                                q.options.map(opt => (
                                    <Form.Check
                                        type="radio"
                                        name={`q-${q.id}`}
                                        key={opt.id}
                                        id={`q-${q.id}-opt-${opt.id}`}
                                        label={opt.content}
                                        checked={answers[q.id] === opt.id}
                                        onChange={() => handleAnswer(q.id, opt.id, q.type)}
                                    />
                                ))}

                            {q.type === 'MULTI_CHOICE' &&
                                q.options.map(opt => (
                                    <Form.Check
                                        type="checkbox"
                                        key={opt.id}
                                        id={`q-${q.id}-opt-${opt.id}`}
                                        label={opt.optionText}
                                        checked={answers[q.id]?.includes(opt.id) || false}
                                        onChange={(e) => handleAnswer(q.id, opt.id, 'MULTI_CHOICE', e.target.checked)}
                                    />
                                ))}
                        </Card>
                    ))}
                </Col>

                <Col md={4}>
                    <Card className="p-3 quiz-sidebar">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6>Đã làm</h6>
                                <h5 className="fw-bold">{Object.keys(answers).length}/{quiz.quizQuestions.length}</h5>
                            </div>
                            <div>
                                <h6>Thời gian</h6>
                                <h5 className="text-primary">{formatTime(timer)}</h5>
                            </div>
                        </div>

                        <div className="sidebar-grid mt-3">
                            {quiz.quizQuestions.map((q, index) => {
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
                            NỘP BÀI
                        </Button>

                        <div className="mt-3">
                            <div><span className="dot done"></span> Đã làm</div>
                            <div><span className="dot blank"></span> Chưa làm</div>
                            <div><span className="dot review"></span> Cần xem lại</div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DoQuizForm;
