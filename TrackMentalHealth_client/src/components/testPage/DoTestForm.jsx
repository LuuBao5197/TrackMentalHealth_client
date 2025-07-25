import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/mbti.css';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DoTestForm = () => {
    const userId = useSelector((state) => state.auth.user.userId);
    const [test, setTest] = useState(null); // chứa toàn bộ object từ API
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timer, setTimer] = useState(0);
    const { testId } = useParams();
    const navigate = useNavigate();
    const [focusedQuestion, setFocusedQuestion] = useState(null);
    const questionRefs = useRef([]);

    useEffect(() => {
        fetchTest(testId);
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [testId]);

    const fetchTest = async (id) => {
        try {
            const res = await axios.get(`http://localhost:9999/api/test/${id}`);
            setTest(res.data);
        } catch (err) {
            alert('Không tìm thấy bài test');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleAnswer = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
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
            setFocusedQuestion(test.questions[index].id);
            setTimeout(() => setFocusedQuestion(null), 1500);
        }
    };
    const handleSubmit = async () => {
        const unanswered = test.questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            alert(`Bạn còn ${unanswered.length} câu chưa làm. Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.`);
            return;
        }

        // Tính tổng điểm dựa trên các câu trả lời
        let totalScore = 0;
        test.questions.forEach(q => {
            const selectedOptionId = answers[q.id];
            const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
            if (selectedOption) {
                totalScore += selectedOption.scoreValue || 0;
            }
        });

        // Tìm kết quả phù hợp theo thang điểm
        let resultText = "Không xác định";
        if (test.results && test.results.length > 0) {
            const found = test.results.find(r =>
                totalScore >= r.minScore && totalScore <= r.maxScore
            );
            if (found) resultText = found.resultText;
        }

        // Tạo danh sách câu trả lời theo format API yêu cầu
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId: parseInt(questionId),
            selectedOptionId
        }));

        // Giả sử userId đang hardcode tạm (có thể thay bằng lấy từ session/localStorage/context)
        const payload = {
            userId: userId, // cần thay bằng id thực tế từ user đăng nhập
            testId: test.id,
            answers: formattedAnswers,
            result: resultText
        };

        try {
            const res = await axios.post('http://localhost:9999/api/test/submitUserTestResult', payload);
            alert(`Đã nộp bài thành công. Tổng điểm của bạn là ${totalScore}. Kết quả: ${resultText}`);
            console.log('Response từ server:', res.data);

            setTimeout(() => navigate('/'), 1500);
        } catch (error) {
            console.error('Lỗi khi gửi kết quả:', error);
            alert('Gửi kết quả thất bại. Vui lòng thử lại.');
        }

        console.log("Answers:", answers);
        console.log("Total Score:", totalScore);
        console.log("Result:", resultText);
    };


    if (!test) return <div className="text-center mt-5">Đang tải bài test...</div>;

    return (
        <Container fluid className="mt-3">
            <Row>
                <Col md={8}>
                    <h5 className="text-warning fw-bold mb-4">{test.title}</h5>
                    <p>{test.instructions}</p>

                    {test.questions.map((q, idx) => (
                        <Card
                            className={`p-3 mb-3 ${focusedQuestion === q.id ? 'focus-highlight' : ''}`}
                            key={q.id}
                            ref={el => (questionRefs.current[idx] = el)}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <h6 className="fw-bold">Câu {q.questionOrder}</h6>
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
                            <p>{q.questionText}</p>

                            {q.options.map((opt) => (
                                <Form.Check
                                    type="radio"
                                    name={`q-${q.id}`}
                                    key={opt.id}
                                    id={`q-${q.id}-opt-${opt.id}`}
                                    label={opt.optionText}
                                    checked={answers[q.id] === opt.id}
                                    onChange={() => handleAnswer(q.id, opt.id)}
                                />
                            ))}
                        </Card>
                    ))}
                </Col>

                <Col md={4}>
                    <Card className="p-3 mbti-sidebar">
                        <div className="d-flex justify-content-between">
                            <div>
                                <h6>Số câu đã làm</h6>
                                <h5 className="fw-bold">{Object.keys(answers).length}/{test.questions.length}</h5>
                            </div>
                            <div>
                                <h6>Thời gian đã làm</h6>
                                <h5 className="text-primary">{formatTime(timer)}</h5>
                            </div>
                        </div>

                        <div className="sidebar-grid mt-3">
                            {test.questions.map((q, index) => {
                                let status = 'blank';
                                if (answers[q.id]) status = 'done';
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
