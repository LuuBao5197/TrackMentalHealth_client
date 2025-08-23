// poseProcessor.js
import { Hands } from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

/**
 * Khởi tạo Hands
 */
export function initHands(handsRef, lastHandResults) {
  if (!handsRef || !lastHandResults) {
    console.error("initHands: handsRef or lastHandResults is undefined");
    return null;
  }
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
  hands.onResults((results) => {
    lastHandResults.current = results;
  });
  return hands;
}

/**
 * Khởi tạo FaceMesh
 */
export function initFaceMesh(faceMeshRef, lastFaceResults) {
  if (!faceMeshRef || !lastFaceResults) {
    console.error("initFaceMesh: faceMeshRef or lastFaceResults is undefined");
    return null;
  }
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
  faceMesh.onResults((results) => {
    lastFaceResults.current = results;
  });
  return faceMesh;
}

/**
 * Khởi tạo Pose (toàn thân: chân, tay, vai, hông...)
 */
export function initPose(poseRef, lastPoseResults) {
  if (!poseRef || !lastPoseResults) {
    console.error("initPose: poseRef or lastPoseResults is undefined");
    return null;
  }
  const pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });
  poseRef.current = pose;
  pose.onResults((results) => {
    lastPoseResults.current = results;
  });
  return pose;
}

/**
 * Xử lý Camera + vẽ canvas + check action
 */
export function initPoseProcessing(videoElement, canvasElement, condition, refs) {
  const { handsRef, faceMeshRef, poseRef, actionDetectedRef, lastFaceResults, lastHandResults, lastPoseResults } = refs || {};

  // Kiểm tra các ref cần thiết
  if (!videoElement || !canvasElement || !actionDetectedRef) {
    console.error("initPoseProcessing: Missing required parameters");
    return null;
  }

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      // Kiểm tra và gửi dữ liệu từ video đến các mô hình
      if (handsRef?.current) {
        await handsRef.current.send({ image: videoElement });
      }
      if (faceMeshRef?.current) {
        await faceMeshRef.current.send({ image: videoElement });
      }
      if (poseRef?.current) {
        await poseRef.current.send({ image: videoElement });
      }

      const canvasCtx = canvasElement.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasElement.width, 0);

      canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      let detected = false;

      // 🎯 Face landmarks (xử lý xoay đầu và vẽ landmarks)
      let foreheadY = null;
      if (lastFaceResults?.current?.multiFaceLandmarks?.length > 0) {
        const landmarks = lastFaceResults.current.multiFaceLandmarks[0];
        const keyIndexes = [10, 152, 1, 234, 454]; // forehead, chin, nose, left cheek, right cheek
        foreheadY = landmarks[10].y;

        // Vẽ các điểm landmarks trên khuôn mặt
        canvasCtx.fillStyle = "cyan";
        keyIndexes.forEach((idx) => {
          const lm = landmarks[idx];
          canvasCtx.beginPath();
          canvasCtx.arc(
            lm.x * canvasElement.width,
            lm.y * canvasElement.height,
            4,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
        });

        // ✅ Kiểm tra xoay đầu
        if (condition?.actionType?.startsWith("TURN_HEAD_")) {
          const nose = landmarks[1];
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          const forehead = landmarks[10];
          const chin = landmarks[152];

          const distLeft = Math.abs(nose.x - leftCheek.x);
          const distRight = Math.abs(nose.x - rightCheek.x);
          const distUp = Math.abs(nose.y - forehead.y);
          const distDown = Math.abs(chin.y - nose.y);

          if (condition.actionType === "TURN_HEAD_LEFT" && distRight < distLeft * 0.8) {
            detected = true;
          }
          if (condition.actionType === "TURN_HEAD_RIGHT" && distLeft < distRight * 0.8) {
            detected = true;
          }
          if (condition.actionType === "TURN_HEAD_UP" && distUp < distDown * 0.7) {
            detected = true;
          }
          if (condition.actionType === "TURN_HEAD_DOWN" && distDown < distUp * 0.7) {
            detected = true;
          }
        }
      }

      // 🎯 Hand landmarks
      if (lastHandResults?.current?.multiHandLandmarks) {
        for (let i = 0; i < lastHandResults.current.multiHandLandmarks.length; i++) {
          let handedness = lastHandResults.current.multiHandedness[i].label;
          if (handedness === "Left") handedness = "Right";
          else if (handedness === "Right") handedness = "Left";

          const landmarks = lastHandResults.current.multiHandLandmarks[i];
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

          // ✅ Kiểm tra tay cao hơn đầu
          if (foreheadY !== null) {
            if (
              condition?.actionType === "LEFT_HAND_UP" &&
              handedness === "Left" &&
              landmarks[9].y < foreheadY
            ) {
              detected = true;
            }
            if (
              condition?.actionType === "RIGHT_HAND_UP" &&
              handedness === "Right" &&
              landmarks[9].y < foreheadY
            ) {
              detected = true;
            }
          }
        }
      }

      // 🎯 Pose landmarks (toàn thân)
      if (lastPoseResults?.current?.poseLandmarks) {
        const poseLandmarks = lastPoseResults.current.poseLandmarks;
        // Vẽ tất cả landmarks với màu xanh lá
        canvasCtx.fillStyle = "lime";
        poseLandmarks.forEach((lm) => {
          canvasCtx.beginPath();
          canvasCtx.arc(
            lm.x * canvasElement.width,
            lm.y * canvasElement.height,
            4,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();
        });

        // Vẽ landmarks của chân với màu nổi bật (đầu gối và mắt cá chân)
        const legLandmarks = [
          { index: 25, label: "Left Knee", color: "yellow" }, // Đầu gối trái
          { index: 26, label: "Right Knee", color: "yellow" }, // Đầu gối phải
          { index: 27, label: "Left Ankle", color: "orange" }, // Mắt cá chân trái
          { index: 28, label: "Right Ankle", color: "orange" }, // Mắt cá chân phải
        ];

        legLandmarks.forEach(({ index, label, color }) => {
          const lm = poseLandmarks[index];
          if (lm) {
            canvasCtx.fillStyle = color;
            canvasCtx.beginPath();
            canvasCtx.arc(
              lm.x * canvasElement.width,
              lm.y * canvasElement.height,
              6, // Kích thước lớn hơn để dễ thấy
              0,
              2 * Math.PI
            );
            canvasCtx.fill();
            // Ghi nhãn để debug
            canvasCtx.font = "12px Arial";
            canvasCtx.fillText(
              label,
              lm.x * canvasElement.width + 8,
              lm.y * canvasElement.height
            );
            // Log tọa độ để kiểm tra
            console.log(`${label}: x=${lm.x}, y=${lm.y}`);
          }
        });

        // ✅ Kiểm tra chân giơ lên (đầu gối cao hơn hông)
        if (condition?.actionType === "LEFT_KNEE_UP") {
          const leftKnee = poseLandmarks[25]; // index 25 = left knee
          const leftHip = poseLandmarks[23]; // index 23 = left hip
          if (leftKnee.y < leftHip.y) {
            detected = true;
            console.log("LEFT_KNEE_UP detected");
          }
        }
        if (condition?.actionType === "RIGHT_KNEE_UP") {
          const rightKnee = poseLandmarks[26]; // index 26 = right knee
          const rightHip = poseLandmarks[24]; // index 24 = right hip
          if (rightKnee.y < rightHip.y) {
            detected = true;
            console.log("RIGHT_KNEE_UP detected");
          }
        }
      }

      actionDetectedRef.current = detected;
      canvasCtx.restore();
    },
    width: 640,
    height: 480,
    facingMode: "user",
  });

  return camera;
}