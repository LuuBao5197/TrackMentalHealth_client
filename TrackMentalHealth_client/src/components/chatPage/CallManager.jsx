import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connectWebSocket, sendCallSignal } from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import "../../assets/css/chat.css";
import ringtone from "../../assets/ringtone/ringtone.mp3";

export default function CallManager({ receiverName }) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  // Lắng nghe tín hiệu call
  useEffect(() => {
    if (!sessionId || !currentUserId) return;

    const disconnect = connectWebSocket({
      sessionId,
      callId: sessionId,
      onCallSignal: (msg) => {
        switch (msg.type) {
          case "CALL_REQUEST":
            if (msg.callerId !== currentUserId) {
              setIncomingCall({
                sessionId: msg.sessionId,
                callerName: msg.callerName,
              });
            }
            break;

          case "CALL_ACCEPTED":
            setIsCalling(false);
            navigate(`/user/video-call/${msg.sessionId}`);
            break;

          case "CALL_REJECTED":
          case "CALL_CANCEL":
            setIsCalling(false);
            setIncomingCall(null);
            break;

          default:
            break;
        }
      },
    });

    return () => disconnect && disconnect();
  }, [sessionId, currentUserId]);

  // Hành động gọi
  const startCall = () => {
    sendCallSignal(sessionId, {
      type: "CALL_REQUEST",
      callerId: currentUserId,
      callerName: receiverName,
      sessionId,
    });
    setIsCalling(true);
  };

  const acceptCall = () => {
    sendCallSignal(sessionId, {
      type: "CALL_ACCEPTED",
      sessionId,
      calleeId: currentUserId,
    });
    setIncomingCall(null);
    navigate(`/user/video-call/${sessionId}`);
  };

  const declineCall = () => {
    sendCallSignal(sessionId, {
      type: "CALL_REJECTED",
      sessionId,
      calleeId: currentUserId,
    });
    setIncomingCall(null);
  };

  const cancelCall = () => {
    sendCallSignal(sessionId, {
      type: "CALL_CANCEL",
      sessionId,
      callerId: currentUserId,
    });
    setIsCalling(false);
  };

  // Chuông gọi
  useEffect(() => {
    const audio = document.getElementById("ringtone");
    if (incomingCall) {
      audio.play().catch(() => console.log("Autoplay blocked"));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [incomingCall]);

  return (
    <>
      <audio id="ringtone" loop>
        <source src={ringtone} type="audio/mpeg" />
      </audio>

      {/* Overlay khi nhận cuộc gọi */}
      {incomingCall && (
        <div className="call-overlay">
          <p>{incomingCall.callerName} is calling...</p>
          <div className="btn-group">
            <button className="btn-accept" onClick={acceptCall}>Accept</button>
            <button className="btn-decline" onClick={declineCall}>Decline</button>
          </div>
        </div>
      )}

      {/* Overlay khi đang gọi */}
      {isCalling && (
        <div className="call-overlay">
          <p>Calling to {receiverName}...</p>
          <button className="btn-cancel" onClick={cancelCall}>Cancel</button>
        </div>
      )}

      {/* Nút gọi */}
      <button
        onClick={startCall}
        title="Video Call"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "absolute",
          right: "10px",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M128 128C92.7 128 64 156.7 64 192L64 448C64 483.3 92.7 512 128 512L384 512C419.3 512 448 483.3 448 448L448 192C448 156.7 419.3 128 384 128L128 128zM496 400L569.5 458.8C573.7 462.2 578.9 464 584.3 464C597.4 464 608 453.4 608 440.3L608 199.7C608 186.6 597.4 176 584.3 176C578.9 176 573.7 177.8 569.5 181.2L496 240L496 400z"/>
        </svg>
      </button>
    </>
  );
}
