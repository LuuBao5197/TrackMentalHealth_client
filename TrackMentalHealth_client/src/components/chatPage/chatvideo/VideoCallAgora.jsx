import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { joinRoom, leaveRoom, destroyRoom, playLocalVideo, toggleCamera, toggleMicrophone } from "../../../services/AgoraService";
import { sendCallSignal } from "../../../services/stompClient";
import { showToast } from "../../../utils/showToast";

export default function VideoCallAgora() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUserId, currentUserName, isCaller, calleeUserId } = location.state || {};
  const agoraCallContainer = useRef(null);

  const [joined, setJoined] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !currentUserId) {
      console.error("[VideoCallAgora] Missing sessionId or currentUserId", { sessionId, currentUserId });
      return;
    }
    if (!agoraCallContainer.current) {
      console.error("[VideoCallAgora] agoraCallContainer is null");
      return;
    }
    if (joinedRef.current) {
      console.log("[VideoCallAgora] Already joined, skip");
      return;
    }

    // đảm bảo container đang hiển thị để Agora render được UI
    agoraCallContainer.current.style.display = "block";

    console.log(`[VideoCallAgora] Join as ${isCaller ? "caller" : "callee"} → room ${sessionId}`, {
      userID: currentUserId,
      userName: currentUserName
    });

    // defer 1 frame để chắc chắn container đã mount
    const raf = requestAnimationFrame(async () => {
      try {
        await joinRoom(agoraCallContainer.current, {
          roomId: sessionId,
          userId: currentUserId,
          userName: currentUserName,
          mode: "one-on-one",
          onLeave: () => {
            sendCallSignal({
              type: "CALL_ENDED",
              callerId: currentUserId,
              callerName: currentUserName,
              calleeId: calleeUserId,
              sessionId,
            });

            // Điều hướng sau khi end call
            navigate(`/user/chat/${sessionId}`);
          },
        });

        // Play local video after joining
        playLocalVideo(agoraCallContainer.current);

        console.log(`[VideoCallAgora] ${isCaller ? "Caller" : "Callee"} joined room OK`);
        joinedRef.current = true;
        setJoined(true);
      } catch (err) {
        console.error("[VideoCallAgora] joinRoom error:", err);
        showToast('Failed to join call', 'error');
        setConnectionError(true);
        // Vẫn hiển thị controls để user có thể end call
        setJoined(true);
      } 
    });

    return () => {
      cancelAnimationFrame(raf);
      try { leaveRoom(); } catch { }
      try { destroyRoom(); } catch { }
      joinedRef.current = false;
      setJoined(false);
      console.log("[VideoCallAgora] cleanup done");
    };
  }, [sessionId, currentUserId, currentUserName, isCaller]);

  const handleEndCall = () => {
    // Gửi tín hiệu cho cả phòng
    sendCallSignal(sessionId, {
      type: "CALL_ENDED",
      from: currentUserId,
    });

    showToast('Call ended...', 'success');
    // Người bấm cũng thoát ngay
    navigate(`/user/chat/${sessionId}`);
  };

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
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }} className="container mt-3 mb-3">
      <nav aria-label="breadcrumb"> 
        <ol className="breadcrumb">
          <li
            className="breadcrumb-item"
            style={{ cursor: "pointer", color: "#038238ff" }}
            onClick={() => navigate("/user/chat/list")}
          >
            Chat
          </li>
          <li className="breadcrumb-item " aria-current="page"
            style={{ cursor: "pointer", color: "#038238ff" }}
            onClick={() => navigate(`/user/chat/${sessionId}`)}
          >
            Chat private
          </li>

          <li className="breadcrumb-item active" aria-current="page">
            Video call
          </li>
        </ol>
      </nav>
      <div className="alert alert-success d-flex justify-content-between align-items-center">
        <span>
          {joined ? "In call..." : `Connecting as ${isCaller ? "caller" : "callee"}...`}
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
            <button
              className="btn btn-sm btn-danger"
              onClick={handleEndCall}
            >
              📞 End Call
            </button>
          </div>
        )}
      </div>

      <div
        ref={agoraCallContainer}
        style={{ flex: 1, minHeight: "400px", background: "#000", position: "relative" }}
      />
    </div>
  );
}
