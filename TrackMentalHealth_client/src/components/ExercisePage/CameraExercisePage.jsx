import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Hands } from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import Swal from "sweetalert2";
import axios from "axios";

const CameraExercisePage = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const faceMeshRef = useRef(null);

  const actionStartTime = useRef(null);
  const actionDetectedRef = useRef(false);

  const [conditions, setConditions] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [condition, setCondition] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isReady, setIsReady] = useState(false);

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
    handsRef.current = hands;
    console.log("Mediapipe Hands initialized");
    return () => {
      console.log("Cleaning up Mediapipe Hands");
      hands.close();
    };
  }, []);

  // 4️⃣ Khởi tạo FaceMesh
  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
    faceMeshRef.current = faceMesh;
    console.log("Mediapipe FaceMesh initialized");
    return () => {
      console.log("Cleaning up Mediapipe FaceMesh");
      faceMesh.close();
    };
  }, []);

  // 5️⃣ Khởi tạo camera
  useEffect(() => {
    if (!isReady) return;
    if (!videoRef.current || !canvasRef.current) {
      setCameraError("Video hoặc canvas chưa sẵn sàng.");
      return;
    }
    const videoElement = videoRef.current;
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (handsRef.current) {
          await handsRef.current.send({ image: videoElement });
        }
        if (faceMeshRef.current) {
          await faceMeshRef.current.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
      facingMode: "user",
    });
    cameraRef.current = camera;
    camera.start().catch((err) => {
      console.error("Failed to start camera:", err);
      setCameraError("Không thể khởi động camera.");
    });
    console.log("Camera initialized");
    return () => {
      console.log("Cleaning up camera");
      camera.stop();
    };
  }, [isReady]);

  // 6️⃣ Xử lý Hands
  useEffect(() => {
    if (!condition || !handsRef.current || !canvasRef.current) return;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    handsRef.current.onResults((results) => {
      // Chỉ vẽ nếu không phải động tác quay đầu
      if (
        condition.actionType === "LEFT_HAND_UP" ||
        condition.actionType === "RIGHT_HAND_UP"
      ) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.scale(-1, 1);
        canvasCtx.translate(-canvasElement.width, 0);
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
            let handedness = results.multiHandedness[i].label;
            if (handedness === "Left") handedness = "Right";
            else if (handedness === "Right") handedness = "Left";
            const landmarks = results.multiHandLandmarks[i];
            // Vẽ chấm
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
            if (
              condition.actionType === "LEFT_HAND_UP" &&
              handedness === "Left" &&
              landmarks[9].y < landmarks[0].y
            ) {
              detected = true;
            }
            if (
              condition.actionType === "RIGHT_HAND_UP" &&
              handedness === "Right" &&
              landmarks[9].y < landmarks[0].y
            ) {
              detected = true;
            }
          }
        }
        actionDetectedRef.current = detected;
        canvasCtx.restore();
      }
    });
  }, [condition]);

  // 7️⃣ Xử lý FaceMesh
  useEffect(() => {
    if (!condition || !faceMeshRef.current || !canvasRef.current) return;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
  
    faceMeshRef.current.onResults((results) => {
      if (
        condition.actionType.startsWith("TURN_HEAD_")
      ) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.scale(-1, 1);
        canvasCtx.translate(-canvasElement.width, 0);
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
  
        let detected = false;
  
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const nose = landmarks[1];       // mũi
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          const forehead = landmarks[10];  // trán
          const chin = landmarks[152];     // cằm
  
          // Xoay trái/phải
          const distLeft = Math.abs(nose.x - leftCheek.x);
          const distRight = Math.abs(nose.x - rightCheek.x);
          if (condition.actionType === "TURN_HEAD_LEFT" && distRight < distLeft * 0.8) detected = true;
          if (condition.actionType === "TURN_HEAD_RIGHT" && distLeft < distRight * 0.8) detected = true;
  
          // Xoay lên/xuống
          const distUp = Math.abs(nose.y - forehead.y);
          const distDown = Math.abs(chin.y - nose.y);
          if (condition.actionType === "TURN_HEAD_UP" && distUp < distDown * 0.7) detected = true;
          if (condition.actionType === "TURN_HEAD_DOWN" && distDown < distUp * 0.7) detected = true;
        }
  
        actionDetectedRef.current = detected;
        canvasCtx.restore();
      }
    });
  }, [condition]);
  

  // 8️⃣ Đếm ngược và chuyển bước
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

  if (cameraError) {
    return <h3 style={{ color: "red" }}>{cameraError}</h3>;
  }
  if (!condition) {
    return <h3>Loading exercise...</h3>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        Step {currentStepIndex + 1} / {conditions.length}:{" "}
        {condition.description} ({condition.durationSeconds} seconds)
      </h2>
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          style={{ display: "none" }}
          autoPlay
          playsInline
        ></video>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ border: "1px solid black" }}
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
          }}
        >
          {!exerciseDone ? `⏳ ${countdown}s` : "✔ Done!"}
        </div>
      </div>
    </div>
  );
};

export default CameraExercisePage;
