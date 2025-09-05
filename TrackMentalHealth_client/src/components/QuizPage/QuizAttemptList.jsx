import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const QuizAttemptList = () => {
    const [attempts, setAttempts] = useState([]);
    const navigate = useNavigate();
    const userId = useSelector((state) => state.auth.user.userId);


    useEffect(() => {
        axios.get(`http://localhost:9999/api/quiz/history/${userId}`)
            .then(res => setAttempts(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container mt-4">
            <h2>My Quiz Attempts</h2>
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Quiz Title</th>
                        <th>Date</th>
                        <th>Score</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {attempts.map((attempt, index) => (
                        <tr key={attempt.attemptId}>
                            <td>{index + 1}</td>
                            <td>{attempt.quizTitle}</td>
                            <td>{new Date(attempt.startTime).toLocaleString()}</td>
                            <td>{new Date(attempt.endTime).toLocaleString()}</td>
                            <td>{attempt.totalScore}</td>
                            <td>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate(`/user/quiz/quiz-attempt/${attempt.attemptId}`)}
                                >
                                    View Detail
                                </button>
                            </td>
                        </tr>
                    ))}
                    {attempts.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">No attempts found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default QuizAttemptList;
