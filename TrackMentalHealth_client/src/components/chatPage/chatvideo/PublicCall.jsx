import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/getCurrentUserID";
import { joinRoom, destroyRoom, playLocalVideo, toggleCamera, toggleMicrophone } from "../../../services/AgoraService";

export default function PublicCall() {
  const roomID = 'public_room';
  const ref = useRef(null);
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  
  const userID = String(
    getCurrentUserId() || Math.floor(Math.random() * 1e6)
  );
  const userName = "Guest " + userID.slice(-4);

  useEffect(() => {
    if (!ref.current) return;
    
    const joinPublicRoom = async () => {
      try {
        await joinRoom(ref.current, {
          roomId: roomID,
          userId: userID,
          userName: userName,
          mode: "group",
        });
        
        // Play local video after joining
        playLocalVideo(ref.current);
        setJoined(true);
      } catch (error) {
        console.error('Error joining public room:', error);
      }
    };

    joinPublicRoom();

    return () => {
      destroyRoom();
    };
  }, [roomID, userID, userName]);

  const handleToggleCamera = async () => {
    try {
      const enabled = await toggleCamera();
      setCameraEnabled(enabled);
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const handleToggleMicrophone = async () => {
    try {
      const enabled = await toggleMicrophone();
      setMicrophoneEnabled(enabled);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  return (
    <div
      style={{ height: "100vh", width: "100vw", position: "relative" }}
      className="container mt-3 mb-3"
    >
      {/* Nút Back */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li
            className="breadcrumb-item"
            style={{ cursor: "pointer", color: "#038238ff" }}
            onClick={() => {
              const confirmExit = window.confirm("Bạn có chắc chắn muốn thoát cuộc gọi?");
              if (confirmExit) {
                navigate("/user/chat/list");
              }
            }}
          >
            Chat
          </li>

          <li className="breadcrumb-item active" aria-current="page">
            Public call
          </li>
        </ol>
      </nav>

      {/* Status and Controls */}
      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <span>
          {joined ? "Connected to public room" : "Connecting to public room..."}
        </span>
        {joined && (
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${cameraEnabled ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggleCamera}
            >
              {cameraEnabled ? '📹' : '📹❌'} Camera
            </button>
            <button
              className={`btn btn-sm ${microphoneEnabled ? 'btn-success' : 'btn-danger'}`}
              onClick={handleToggleMicrophone}
            >
              {microphoneEnabled ? '🎤' : '🎤❌'} Mic
            </button>
          </div>
        )}
      </div>

      <div ref={ref} style={{ height: "90%", width: "100%", position: "relative" }} />
    </div>
  );
}
