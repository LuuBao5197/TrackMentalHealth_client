import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useParams } from "react-router";

export default function QuizAttemptDetail() {
    const [quizDetail, setQuizDetail] = useState(null);
    const {attemptId} = useParams();
    const fetchDetail = async () => {
        const data = await axios
            .get(`http://localhost:9999/api/quiz/detail/${attemptId}`);
        console.log(data);
        setQuizDetail(data.data);


    }
    useEffect(() => {
        fetchDetail();

    }, [attemptId]);

    if (!quizDetail) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h3>{quizDetail.quizTitle}</h3>
            <p>
                <strong>Start:</strong> {new Date(quizDetail.startTime).toLocaleString()} <br />
                <strong>End:</strong> {new Date(quizDetail.endTime).toLocaleString()}<br />
                <strong>Total Score:</strong> {quizDetail.totalScore} <br />
                <strong>Result:</strong> {quizDetail.resultLabel}
            </p>

            <div className="accordion" id="quizAccordion">
                {quizDetail.answers.map((q, index) => (
                    <div className="accordion-item" key={q.questionId}>
                        <h2 className="accordion-header" id={`heading-${index}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${index}`}
                            >
                                {index + 1}.{" "}
                                <span
                                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                                ></span>{" "}
                                <span className="badge bg-secondary ms-2">
                                    {q.questionType}
                                </span>
                            </button>
                        </h2>
                        <div
                            id={`collapse-${index}`}
                            className="accordion-collapse collapse"
                            data-bs-parent="#quizAccordion"
                        >
                            <div className="accordion-body">

                                {q.questionType === "MATCHING" && q.matchingAnswers && (
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Left</th>
                                                <th>Right</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {q.matchingAnswers.map((pair, i) => (
                                                <tr key={i}>
                                                    <td>{pair.leftText}</td>
                                                    <td>{pair.rightText}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {q.questionType === "ORDERING" && q.orderingAnswers && (
                                    <ol>
                                        {q.orderingAnswers
                                            .sort((a, b) => a.userOrder - b.userOrder)
                                            .map((item) => (
                                                <li key={item.itemId}>{item.text}</li>
                                            ))}
                                    </ol>
                                )}

                                {q.questionType === "TEXT_INPUT" && (
                                    <p>
                                        <strong>User Input:</strong> {q.userInput}
                                    </p>
                                )}

                                {(q.questionType === "SINGLE_CHOICE" ||
                                    q.questionType === "MULTI_CHOICE" ||
                                    q.questionType === "SCORE_BASED") &&
                                    q.selectedOptions && (
                                        <ul>
                                            {q.selectedOptions.map((opt) => (
                                                <li
                                                    key={opt.id}
                                                    className={opt.correct ? "text-success" : ""}
                                                >
                                                    {opt.content}{" "}
                                                    {opt.correct && (
                                                        <span className="badge bg-success">Correct</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
