import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/getCurrentUserID";
import { joinRoom, destroyRoom } from "../../../services/ZegoService";

export default function PublicCall() {
  const { id: paramRoomID } = useParams();
  const roomID =
    paramRoomID || String(Math.floor(100000 + Math.random() * 900000));

  const ref = useRef(null);
  const navigate = useNavigate();
  const userID = String(
    getCurrentUserId() || Math.floor(Math.random() * 1e6)
  );
  const userName = "Guest " + userID.slice(-4);

  useEffect(() => {
    if (!ref.current) return;
    joinRoom(ref.current, {
      roomID,
      userID,
      userName,
      mode: "group", // hoặc "one-on-one"
      showPreJoinView: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
    });

    return () => {
      destroyRoom();
    };
  }, [roomID]);

  return (
    <div
      style={{ height: "100vh", width: "100vw", position: "relative" }}
      className="container mt-3 mb-3"
    >
      {/* Nút Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          padding: "6px 12px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#068445ff",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <div ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
