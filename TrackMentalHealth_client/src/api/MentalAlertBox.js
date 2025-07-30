import React, { useEffect, useState } from "react";
import axios from "axios";

const MentalAlertBox = () => {
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:9999/api/mental/analyze", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAlertMessage(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setAlertMessage("Không thể lấy thông tin phân tích tâm lý.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang phân tích dữ liệu tâm lý...</p>;

  return (
    <div className="alert alert-warning mt-4">
      <h5 className="fw-bold">📢 Cảnh báo sức khỏe tinh thần</h5>
      <p>{alertMessage}</p>
    </div>
  );
};

export default MentalAlertBox;
