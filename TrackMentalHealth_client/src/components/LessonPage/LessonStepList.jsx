import React, { useEffect, useState } from "react";
import axios from "axios";

const LessonStepList = ({ lessonId, selectedStepId, onStepSelect }) => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/api/lesson/${lessonId}/steps`);
        setSteps(response.data);
      } catch (error) {
        console.error("Error fetching lesson steps:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchSteps();
    }
  }, [lessonId]);

  return (
    <div style={{ width: "300px", padding: "1rem", borderLeft: "1px solid #ccc", height: "100vh", overflowY: "auto" }}>
      <h3>Nội dung bài học</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {steps.map((step) => (
            <li
              key={step.id}
              onClick={() => onStepSelect(step)}
              style={{
                padding: "10px",
                backgroundColor: selectedStepId === step.id ? "#eef" : "transparent",
                cursor: "pointer",
                borderRadius: "6px",
                marginBottom: "5px",
                border: selectedStepId === step.id ? "1px solid #99f" : "1px solid transparent",
              }}
            >
              <strong>{step.stepNumber}. {step.title.split("\n")[0]}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonStepList;
