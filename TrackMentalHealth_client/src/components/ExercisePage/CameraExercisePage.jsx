import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Swal from "sweetalert2";
import axios from "axios";

const CameraExercisePage = () => {
  const { id } = useParams(); // exerciseId từ URL
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const actionStartTime = useRef(null);
  const actionDetectedRef = useRef(false);

  const [exerciseDone, setExerciseDone] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [condition, setCondition] = useState(null);

  // 1️⃣ Lấy điều kiện hoàn thành từ API
  useEffect(() => {
    axios
      .get(`http://localhost:9999/api/exercises/${id}/conditions`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const c = res.data[0];
          const duration = parseInt(c.duration, 10) || 3; // đổi "4" thành 4
          setCondition({
            id: c.id,
            actionType: c.type, // ví dụ: LEFT_HAND_UP
            description: c.description,
            durationSeconds: duration
          });
          setCountdown(duration);
        }
      })
      .catch((err) => {
        console.error("Failed to load condition", err);
      });
  }, [id]);

  // 2️⃣ Khởi tạo camera + Mediapipe Hands
  useEffect(() => {
    if (!condition) return; // chỉ chạy khi đã có điều kiện

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Lật video
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);

      // Vẽ video
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      let detected = false;

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          // Đảo nhãn do lật ngang
          let handedness = results.multiHandedness[i].label;
          if (handedness === "Left") handedness = "Right";
          else if (handedness === "Right") handedness = "Left";

          const landmarks = results.multiHandLandmarks[i];

          // Vẽ landmark
          canvasCtx.fillStyle = "red";
          landmarks.forEach((lm) => {
            canvasCtx.beginPath();
            canvasCtx.arc(
              lm.x * canvasElement.width,
              lm.y * canvasElement.height,
              5,
              0,
              2 * Math.PI
            );
            canvasCtx.fill();
          });

          // ✅ Check điều kiện từ DB
          switch (condition.actionType) {
            case "LEFT_HAND_UP":
              if (handedness === "Left" && landmarks[9].y < landmarks[0].y) {
                detected = true;
              }
              break;
            case "RIGHT_HAND_UP":
              if (handedness === "Right" && landmarks[9].y < landmarks[0].y) {
                detected = true;
              }
              break;
            default:
              console.warn("Unknown action type:", condition.actionType);
          }
        }
      }

      actionDetectedRef.current = detected;
      canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [condition]);

  // 3️⃣ Đếm ngược theo duration từ DB
  useEffect(() => {
    if (exerciseDone || !condition) return;

    const interval = setInterval(() => {
      if (actionDetectedRef.current) {
        if (!actionStartTime.current) {
          actionStartTime.current = Date.now();
          setCountdown(condition.durationSeconds);
        } else {
          const elapsed = (Date.now() - actionStartTime.current) / 1000;
          const timeLeft = Math.max(
            0,
            condition.durationSeconds - Math.floor(elapsed)
          );
          setCountdown(timeLeft);

          if (elapsed >= condition.durationSeconds) {
            setExerciseDone(true);
            Swal.fire({
              icon: "success",
              title: "Good job!",
              text: `You completed: ${condition.description} for ${condition.durationSeconds} seconds!`,
            });
          }
        }
      } else {
        actionStartTime.current = null;
        setCountdown(condition.durationSeconds);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [exerciseDone, condition]);

  if (!condition) {
    return <h3>Loading exercise condition...</h3>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        Action: {condition.description} ({condition.durationSeconds} seconds)
      </h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video ref={videoRef} style={{ display: "none" }}></video>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ border: "1px solid black" }}
        />
        {/* Countdown */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: "30px",
            fontWeight: "bold",
            color: exerciseDone ? "green" : "yellow",
            userSelect: "none",
          }}
        >
          {!exerciseDone ? `⏳ ${countdown}s` : "✔ Done!"}
        </div>
      </div>
    </div>
  );
};

export default CameraExercisePage;
