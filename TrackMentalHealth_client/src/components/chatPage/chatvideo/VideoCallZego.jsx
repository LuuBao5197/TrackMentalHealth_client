import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { joinRoom, leaveRoom, destroyRoom } from "../../../services/ZegoService";
import { sendCallSignal } from "../../../services/stompClient";
import { showToast } from "../../../utils/showToast";

export default function VideoCallZego() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUserId, currentUserName, isCaller, calleeUserId } = location.state || {};
  const zegoCallContainer = useRef(null);

  const [joined, setJoined] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !currentUserId) {
      console.error("[VideoCallZego] Missing sessionId or currentUserId", { sessionId, currentUserId });
      return;
    }
    if (!zegoCallContainer.current) {
      console.error("[VideoCallZego] zegoCallContainer is null");
      return;
    }
    if (joinedRef.current) {
      console.log("[VideoCallZego] Already joined, skip");
      return;
    }

    // đảm bảo container đang hiển thị để Zego render được UI
    zegoCallContainer.current.style.display = "block";

    console.log(`[VideoCallZego] Join as ${isCaller ? "caller" : "callee"} → room ${sessionId}`, {
      userID: currentUserId,
      userName: currentUserName
    });

    // defer 1 frame để chắc chắn container đã mount
    const raf = requestAnimationFrame(() => {
      joinRoom(zegoCallContainer.current, {
        roomID: sessionId,
        userID: currentUserId,
        userName: currentUserName,
        mode: "one-on-one",
        onLeave: () => {

          sendCallSignal({
            type: "CALL_ENDED",
            callerId: currentUserId,
            callerName: currentUserName,
            calleeId: calleeUserId, // nhớ truyền từ location.state
            sessionId, // giữ lại sessionId nếu cần
          });

          // Điều hướng sau khi end call
          navigate(`/user/chat/${sessionId}`);
        },
      })

        .then(() => {
          console.log(`[VideoCallZego] ${isCaller ? "Caller" : "Callee"} joined room OK`);
          joinedRef.current = true;
          setJoined(true);
        })
        .catch((err) => {
          console.error("[VideoCallZego] joinRoom error:", err);
        });
    });

    return () => {
      cancelAnimationFrame(raf);
      try { leaveRoom(); } catch { }
      try { destroyRoom(); } catch { }
      joinedRef.current = false;
      setJoined(false);
      console.log("[VideoCallZego] cleanup done");
    };
  }, [sessionId, currentUserId, currentUserName, isCaller]);

  const handleEndCall = () => {
    // Gửi tín hiệu cho cả phòng
    sendCallSignal(sessionId, {
      type: "CALL_ENDED",
      from: currentUserId,
    });

    showToast({ message: 'Call ended...', type: ToastTypes.SUCCESS })
    // Người bấm cũng thoát ngay
    navigate(`/user/chat/${sessionId}`);
  };


  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
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
      </div>

      <div
        ref={zegoCallContainer}
        style={{ flex: 1, minHeight: "400px", background: "#000" }}
      />
    </div>
  );
}
