import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/mbti.css';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

export const questions = [
    {
        id: 1,
        content: 'Bạn cảm thấy thoải mái khi ở trong một nhóm người lạ.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 2,
        content: 'Bạn thường lên kế hoạch rõ ràng trước khi thực hiện điều gì đó.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 3,
        content: 'Bạn dễ bị phân tâm bởi những điều xung quanh.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 4,
        content: 'Bạn thích làm việc một mình hơn là theo nhóm.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 5,
        content: 'Bạn thường tin vào trực giác hơn là phân tích logic.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 6,
        content: 'Bạn cảm thấy mệt mỏi sau khi giao tiếp xã hội lâu dài.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 7,
        content: 'Bạn thích những hoạt động có cấu trúc hơn là linh hoạt.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 8,
        content: 'Bạn thường đưa ra quyết định dựa trên cảm xúc.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 9,
        content: 'Bạn dễ dàng kết nối với cảm xúc của người khác.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    {
        id: 10,
        content: 'Bạn cảm thấy áp lực khi phải đưa ra quyết định nhanh.',
        optionA: 'Đúng',
        optionB: 'Sai'
    },
    ...Array.from({ length: 60 }, (_, i) => ({
        id: i + 11,
        content: `Câu hỏi MBTI số ${i + 11}`,
        optionA: 'Đúng',
        optionB: 'Sai'
    }))
];

const DoTestForm = () => {
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timer, setTimer] = useState(0);
    const [focusedQuestion, setFocusedQuestion] = useState(null);
    const questionRefs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleAnswer = (id, option) => {
        setAnswers(prev => ({ ...prev, [id]: option }));
    };

    const toggleMarkReview = (id) => {
        setMarkedForReview(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };


    const handleSubmit = () => {
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            alert(`Bạn còn ${unanswered.length} câu chưa làm. Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.`);
            return;
        }
        alert('Bài test đã được nộp!');
        console.log(answers);
    };


    const scrollToQuestion = (index) => {
        const el = questionRefs.current[index];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setFocusedQuestion(questions[index].id);
            setTimeout(() => setFocusedQuestion(null), 1500);
        }
    };

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col md={8}>
                    <h5 className="text-warning fw-bold mb-4">TRẮC NGHIỆM TÍNH CÁCH MBTI MIỄN PHÍ</h5>
                    {questions.map((q, idx) => (
                        <Card
                            className={`p-3 mb-3 ${focusedQuestion === q.id ? 'focus-highlight' : ''}`}
                            key={q.id}
                            ref={el => (questionRefs.current[idx] = el)}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <h6 className="fw-bold">Câu {q.id}</h6>
                                <div>
                                    <span
                                        className="mark-review"
                                        onClick={() => toggleMarkReview(q.id)}
                                    >
                                        Lát kiểm tra lại
                                        <span className={markedForReview.includes(q.id) ? 'mark-dot active' : 'mark-dot'}></span>
                                    </span>
                                </div>
                            </div>
                            <p>{q.content}</p>
                            <Form.Check
                                type="radio"
                                name={`q-${q.id}`}
                                id={`q-${q.id}-A`}
                                label={`A. ${q.optionA}`}
                                checked={answers[q.id] === 'A'}
                                onChange={() => handleAnswer(q.id, 'A')}
                            />
                            <Form.Check
                                type="radio"
                                name={`q-${q.id}`}
                                id={`q-${q.id}-B`}
                                label={`B. ${q.optionB}`}
                                checked={answers[q.id] === 'B'}
                                onChange={() => handleAnswer(q.id, 'B')}
                            />
                        </Card>
                    ))}
                </Col>

                <Col md={4}>
                    <Card className="p-3 mbti-sidebar">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6>Số câu đã làm</h6>
                                <h5 className="fw-bold">{Object.keys(answers).length}/{questions.length}</h5>
                            </div>
                            <div>
                                <h6>Thời gian đã làm</h6>
                                <h5 className="text-primary">{formatTime(timer)}</h5>
                            </div>
                        </div>
                        <div className="sidebar-grid mt-3">
                            {questions.map((q, index) => {
                                let status = 'blank';
                                if (answers[q.id]) status = 'done';
                                if (markedForReview.includes(q.id)) status = 'review';
                                return (
                                    <div
                                        key={q.id}
                                        className={`sidebar-dot ${status}`}
                                        onClick={() => scrollToQuestion(index)}
                                    >
                                        {q.id}
                                    </div>
                                );
                            })}
                        </div>
                        <Button className="w-100 mt-4 bg-warning border-0 text-white fw-bold" onClick={handleSubmit}>
                            NỘP BÀI
                        </Button>
                        <div className="mt-3">
                            <div><span className="dot done"></span> Câu đã làm</div>
                            <div><span className="dot blank"></span> Câu chưa làm</div>
                            <div><span className="dot review"></span> Câu cần kiểm tra lại</div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DoTestForm;
