import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MentalAlertBox = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:9999/api/mental/analyze", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setResult(res.data); // JSON result from backend
        setLoading(false);
      })
      .catch(() => {
        setResult({
          description: "Unable to fetch mental health analysis.",
          suggestion: null,
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Analyzing your mental health data...</p>;

  return (
    <div
      className={`alert mt-4 ${
        result?.level === 1 ? "alert-success" : "alert-warning"
      }`}
    >
      <h5 className="fw-bold">
        {result?.level === 1
          ? "💡 Your mental state is stable"
          : "📢 Mental health alert"}
      </h5>

      <p>{result?.description || "No description available."}</p>

      {result?.suggestion?.type === "motivation" && (
        <div className="mt-3">
          <p className="fw-bold text-success">🌱</p>
          <p>{result.suggestion.message}</p>
        </div>
      )}

      {result?.suggestion?.type === "test" && (
        <div className="mt-3">
          <p className="mb-1 fw-bold">
            🧪 Suggested test: {result.suggestion.testTitle}
          </p>
          <p>{result.suggestion.testDescription}</p>
          <Link
            to={`/user/doTest/${result.suggestion.testId}`}
            className="btn btn-outline-primary"
          >
            👉 Take the test now
          </Link>
        </div>
      )}

      {result?.suggestion?.type === "emergency" && (
        <div className="mt-3">
          <p className="text-danger fw-bold">🚨 Emergency alert</p>
          <p>{result.suggestion.message}</p>
        </div>
      )}
      {result?.level === 4 && (
        <div className="mt-3">
          <p className="text-danger fw-bold">⚠️ Your condition is severe</p>
          <Link to="/" className="btn btn-danger">
            👨‍⚕️ Contact a doctor now
          </Link>
        </div>
      )}
    </div>
  );
};

export default MentalAlertBox;
