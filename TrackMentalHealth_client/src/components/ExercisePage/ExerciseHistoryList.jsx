import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const ExerciseHistoryList = () => {
  const [history, setHistory] = useState([]);
  const userId = useSelector((state) => state.auth.user.userId);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:9999/api/exercise-history/user/${userId}`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("❌ Error fetching exercise history:", err));
  }, [userId]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🏋️‍♂️ My Exercise History</h2>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Exercise Title</th>
            <th>Status</th>
            <th>Score</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>
                {item.status === "success" ? (
                  <span className="badge bg-success">Success</span>
                ) : (
                  <span className="badge bg-danger">Failed</span>
                )}
              </td>
              <td>{item.score}</td>
              <td>
                {item.difficultyLevel ? (
                  <span
                    className={`badge ${
                      item.difficultyLevel.toLowerCase() === "easy"
                        ? "bg-success"
                        : item.difficultyLevel.toLowerCase() === "medium"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {item.difficultyLevel}
                  </span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">
                No exercise history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExerciseHistoryList;
