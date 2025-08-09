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
        setResult(res.data); // Gán kết quả phân tích vào biến `result`
        setLoading(false);
      })
      .catch((err) => {
        setResult({
          description: "Không thể lấy thông tin phân tích tâm lý.",
          suggestion: null,
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang phân tích dữ liệu tâm lý...</p>;

  return (
    <div className="alert alert-warning mt-4">
      <h5 className="fw-bold">📢 Cảnh báo sức khỏe tinh thần</h5>
      <p>{result?.description || "Không có mô tả."}</p>

      {result?.suggestion?.type === "test" && (
        <div className="mt-3">
          <p className="mb-1 fw-bold">
            🧪 Gợi ý bài test phù hợp: {result.suggestion.testTitle}
          </p>
          <p>{result.suggestion.testDescription}</p>
          <p>
            <strong>Hướng dẫn:</strong> {result.suggestion.instructions}
          </p>
          <Link
            to={`/TrackMentalHealth/user/doTest/${result.suggestion.testId}`}
            className="btn btn-outline-primary"
          >
            👉 Làm bài test ngay
          </Link>
        </div>
      )}

      {result?.suggestion?.type === "emergency" && (
        <div className="mt-3">
          <p className="text-danger fw-bold">🚨 Cảnh báo khẩn cấp</p>
          <p>{result.suggestion.message}</p>
        </div>
      )}
    </div>
  );
};

export default MentalAlertBox;
