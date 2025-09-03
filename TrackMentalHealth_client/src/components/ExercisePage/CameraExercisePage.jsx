// src/components/ExercisePage/CameraExercisePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

// Import các hàm từ poseProcessor.js
import { initHands, initFaceMesh, initPose, initPoseProcessing } from "./poseProcessor";
import { title } from "process";

const CameraExercisePage = ({ exercise }) => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const lastHandResults = useRef(null);
  const lastFaceResults = useRef(null);
  const lastPoseResults = useRef(null);
  const actionStartTime = useRef(null);
  const actionDetectedRef = useRef(false);

  const [conditions, setConditions] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [condition, setCondition] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Global exercise countdown
  const [globalTimeLeft, setGlobalTimeLeft] = useState(() => {
    if (!exercise) return 0;
    if (exercise.difficultyLevel === "Easy") return 360;
    if (exercise.difficultyLevel === "Medium") return 160;
    if (exercise.difficultyLevel === "Hard") return 100;
    return exercise.estimatedDuration || 120;
  });

  // 1️⃣ Lấy danh sách điều kiện từ API
  useEffect(() => {
    axios
      .get(`http://localhost:9999/api/exercises/${id}/conditions`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setConditions(res.data);
          const first = res.data[0];
          setCondition({
            id: first.id,
            actionType: first.type,
            description: first.description,
            durationSeconds: parseInt(first.duration, 10) || 3,
          });
          setCountdown(parseInt(first.duration, 10) || 3);
        }
      })
      .catch((err) => {
        console.error("Failed to load conditions", err);
      });
  }, [id]);

  // 2️⃣ Kiểm tra refs sẵn sàng
  useEffect(() => {
    const checkRefs = () => {
      if (videoRef.current && canvasRef.current) {
        setIsReady(true);
      }
    };
    checkRefs();
    const interval = setInterval(checkRefs, 100);
    return () => clearInterval(interval);
  }, []);

  // 3️⃣ Khởi tạo Hands
  useEffect(() => {
    const hands = initHands(handsRef, lastHandResults);
    return () => hands?.close();
  }, []);

  // 4️⃣ Khởi tạo FaceMesh
  useEffect(() => {
    const faceMesh = initFaceMesh(faceMeshRef, lastFaceResults);
    return () => faceMesh?.close();
  }, []);

  // 5️⃣ Khởi tạo Pose
  useEffect(() => {
    const pose = initPose(poseRef, lastPoseResults);
    return () => pose?.close();
  }, []);

  // 6️⃣ Khởi tạo camera và xử lý
  useEffect(() => {
    if (!isReady || !condition) return;
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Video hoặc canvas chưa sẵn sàng.");
      return;
    }
    if (!handsRef.current || !faceMeshRef.current || !poseRef.current) {
      setCameraError("Mediapipe modules chưa sẵn sàng.");
      return;
    }

    const refs = {
      handsRef,
      faceMeshRef,
      poseRef,
      actionDetectedRef,
      lastFaceResults,
      lastHandResults,
      lastPoseResults,
    };

    const camera = initPoseProcessing(videoRef.current, canvasRef.current, condition, refs);
    if (!camera) {
      setCameraError("Không thể khởi tạo camera processing.");
      return;
    }

    cameraRef.current = camera;
    camera.start().catch((err) => {
      console.error("Failed to start camera:", err);
      setCameraError("Không thể khởi động camera.");
    });

    return () => {
      camera.stop();
    };
  }, [isReady, condition]);

  // 7️⃣ Đếm ngược và chuyển bước
  useEffect(() => {
    if (exerciseDone || !condition) return;
    const interval = setInterval(() => {
      if (actionDetectedRef.current) {
        if (!actionStartTime.current) {
          actionStartTime.current = Date.now();
          setCountdown(condition.durationSeconds);
        } else {
          const elapsed = (Date.now() - actionStartTime.current) / 1000;
          const timeLeft = Math.max(0, condition.durationSeconds - Math.floor(elapsed));
          setCountdown(timeLeft);
          if (elapsed >= condition.durationSeconds) {
            if (currentStepIndex < conditions.length - 1) {
              const nextIndex = currentStepIndex + 1;
              const next = conditions[nextIndex];
              setCurrentStepIndex(nextIndex);
              setCondition({
                id: next.id,
                actionType: next.type,
                description: next.description,
                durationSeconds: parseInt(next.duration, 10) || 3,
              });
              setCountdown(parseInt(next.duration, 10) || 3);
              actionStartTime.current = null;
              actionDetectedRef.current = false;
            } else {
              setExerciseDone(true);
              Swal.fire({
                icon: "success",
                title: "Great job!",
                text: "You finished the whole exercise!",
              });
            }
          }
        }
      } else {
        actionStartTime.current = null;
        setCountdown(condition.durationSeconds);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [exerciseDone, condition, currentStepIndex, conditions]);

  // 8️⃣ Global countdown timer
  useEffect(() => {
    if (globalTimeLeft <= 0 || exerciseDone) return;
    const timer = setInterval(() => {
      setGlobalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExerciseDone(true);
          Swal.fire({
            icon: "warning",
            title: "⏰ Time's up!",
            text: "You ran out of time for this exercise.",
          });
          cameraRef.current?.stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [globalTimeLeft, exerciseDone]);

  // 9️⃣ Khi hoàn thành → tính điểm + lưu lịch sử
  useEffect(() => {
    if (exerciseDone) {
      const totalSteps = conditions.length;
      const stepsDone = currentStepIndex + 1;
      const totalTime =
        exercise.difficultyLevel === "Medium"
          ? 160
          : exercise.difficultyLevel === "Hard"
          ? 100
          : exercise.estimatedDuration || 120;

      const maxScoreTime = totalTime - 30; // ⏳ điểm tối đa khi còn lại (totalTime - 30)

      let score = 0;
      let status = "fail";

      if (stepsDone === totalSteps) {
        // ✅ Hoàn thành hết
        if (globalTimeLeft >= maxScoreTime) {
          score = 100;
        } else {
          score = Math.round((globalTimeLeft / maxScoreTime) * 100);
        }
        status = "success";
      } else {
        // ❌ Fail → tính theo % bước
        score = Math.round((stepsDone / totalSteps) * 100);
        status = "fail";
      }

      axios
        .post("http://localhost:9999/api/exercise-history", {
          userId: 1, // ⚠️ TODO: thay bằng userId thực tế từ auth
          exerciseId: exercise.id,
          status: status,
          score: score,
          title: exercise.title,
          difficultyLevel: exercise.difficultyLevel,
        })
        .then(() => {
          console.log("✅ Exercise history saved!");
        })
        .catch((err) => {
          console.error("❌ Failed to save history:", err);
        });
    }
  }, [exerciseDone]);


  // UI render
  if (cameraError) {
    return <h3 style={{ color: "red" }}>{cameraError}</h3>;
  }
  if (!condition) {
    return <h3>Loading exercise...</h3>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      {/* Global timer */}
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ color: "red" }}>⏱ Total Time Left: {globalTimeLeft}s</h3>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        {conditions.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <div
              key={step.id}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: isCompleted ? "limegreen" : isCurrent ? "orange" : "#ccc",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                margin: "0 10px",
                border: isCurrent ? "3px solid #333" : "2px solid transparent",
                transition: "all 0.3s ease",
              }}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <h2>{condition.description}</h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline></video>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ border: "1px solid black", borderRadius: "8px" }}
        />
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: "30px",
            fontWeight: "bold",
            color: exerciseDone ? "green" : "yellow",
            userSelect: "none",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
          }}
        >
          {!exerciseDone ? `⏳ ${countdown}s` : "✔ Done!"}
        </div>
      </div>
    </div>
  );
};

export default CameraExercisePage;
