// src/pages/TestHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Alert, Table, Button } from "react-bootstrap";
import { useSelector } from "react-redux";

const TestHistory = () => {
    const userId = useSelector((state) => state.auth.user.userId);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `http://localhost:9999/api/test/getTestHistory/${userId}`
                );
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching test history:", err);
                setError("Failed to load test history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    if (loading) {
        return (
            <div className="text-center mt-4">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-4">
                {error}
            </Alert>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Test History</h2>
            <Table striped bordered hover responsive>
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Test Title</th>
                        <th>Started At</th>
                        <th>Completed At</th>
                        <th>Total Score</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <tr key={item.attemptId}>
                                <td>{index + 1}</td>
                                <td>{item.testTitle}</td>
                                <td>{new Date(item.startedAt).toLocaleString()}</td>
                                <td>{new Date(item.completedAt).toLocaleString()}</td>
                                <td>{item.totalScore}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/user/test-attempt-detail/${item.attemptId}`)
                                        }
                                    >
                                        View Detail
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No test history found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default TestHistory;
