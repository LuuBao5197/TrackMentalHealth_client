import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import Swal from "sweetalert2";

const CameraExercisePage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const leftHandUpStart = useRef(null);
  const leftHandUpRef = useRef(false);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
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

      // Lật canvas ngang
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);

      // Vẽ video đã lật
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      let leftHandUp = false;

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          // Đảo nhãn do canvas lật ngang
          let handedness = results.multiHandedness[i].label;
          if (handedness === "Left") handedness = "Right";
          else if (handedness === "Right") handedness = "Left";

          const landmarks = results.multiHandLandmarks[i];

          // Vẽ landmark đỏ
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

          // Kiểm tra giơ tay trái
          if (handedness === "Left" && landmarks[9].y < landmarks[0].y) {
            leftHandUp = true;
          }
        }
      }

      leftHandUpRef.current = leftHandUp;

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
  }, []);

  useEffect(() => {
    if (exerciseDone) return;

    const interval = setInterval(() => {
      if (leftHandUpRef.current) {
        if (!leftHandUpStart.current) {
          leftHandUpStart.current = Date.now();
          setCountdown(3);
        } else {
          const elapsed = (Date.now() - leftHandUpStart.current) / 1000;
          const timeLeft = Math.max(0, 3 - Math.floor(elapsed));
          setCountdown(timeLeft);
          if (elapsed >= 3) {
            setExerciseDone(true);
            Swal.fire({
              icon: "success",
              title: "Good job!",
              text: "You raised your left hand for 3 seconds!",
            });
          }
        }
      } else {
        leftHandUpStart.current = null;
        setCountdown(3);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [exerciseDone]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Raise your left hand for 3 seconds</h2>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video ref={videoRef} style={{ display: "none" }}></video>
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ border: "1px solid black" }}
        />
        {/* Đồng hồ countdown ngoài canvas */}
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
