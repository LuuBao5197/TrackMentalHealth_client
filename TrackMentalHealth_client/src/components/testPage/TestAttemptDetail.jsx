// src/pages/TestAttemptDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spinner, Alert } from "react-bootstrap";

const TestAttemptDetail = () => {
  const { id } = useParams(); // Lấy attemptId từ URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testDetail, setTestDetail] = useState({});
  useEffect(() => {
    const fetchTestDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:9999/api/test/getTestHistory/test_attempt/${id}`
        );
        // console.log(res)
        setTestDetail(res.data);
      } catch (err) {
        console.error("Error fetching test detail:", err);
        setError("Failed to load test details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [id]);

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
      {console.log(testDetail)}
      <h2 className="mb-4"> {testDetail.testTitle}</h2>
      <p className="mb-4"> <b>Start time:</b> {new Date(testDetail.startedAt).toLocaleString()}</p>
      <p className="mb-4"> <b>Completed At:</b>{new Date(testDetail.completedAt).toLocaleString()}</p>
      <p className="mb-4"> <b>Total score:</b> {testDetail.totalScore}</p>
      <p className="mb-4"> <b>Result:</b> {testDetail.resultLabel}</p>

      {testDetail.detailDTOList.map((q, idx) => (
        <div className="card mb-3" key={idx}>
          <div className="card-body">
            <h5 className="card-title">
              Question {idx + 1}: {q.questionInstruction + ':' + q.questionText}
            </h5>
            <table className="table table-bordered table-hover mt-3">
              <thead className="table-light">
                <tr>
                  <th>Option</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {q.options.map((opt) => {
                  const isSelected = opt.optionText === q.selectedOptionText;
                  return (
                    <tr
                      key={opt.id}
                      className={isSelected ? "table-success" : ""}
                    >
                      <td>{opt.optionText}</td>
                      <td>{opt.scoreValue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2">
              <strong>Selected Answer:</strong>{" "}
              <span className="text-primary">{q.selectedOptionText || "None"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestAttemptDetail;
