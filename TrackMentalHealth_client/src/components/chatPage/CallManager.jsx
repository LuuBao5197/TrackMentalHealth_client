import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWebSocket, sendWebSocketMessage } from "../../services/stompClient";
import "../../assets/css/chat.css";
import ringtone from "../../assets/ringtone/ringtone.mp3";

export default function CallManager({ sessionId, currentUserId, receiverName }) {
    const navigate = useNavigate();

    // Trạng thái
    const [incomingCall, setIncomingCall] = useState(null);
    const [isCalling, setIsCalling] = useState(false);

    // ====== 1. Lắng nghe tín hiệu call qua WebSocket ======
    useEffect(() => {
        const disconnect = connectWebSocket({
            videoCallId: sessionId, // ✅ Sử dụng videoCallId thay vì sessionId cho chat
            onVideoSignal: (msg) => {
                switch (msg.type) {
                    case "CALL_REQUEST":
                        if (msg.callerId !== currentUserId) {
                            setIncomingCall({
                                sessionId: msg.sessionId,
                                callerName: msg.callerName,
                            });
                        }
                        break;

                    case "CALL_ACCEPT":
                        if (msg.callerId !== currentUserId) {
                            setIsCalling(false);
                            navigate(`/user/video-call/${msg.sessionId}`);
                        }
                        break;

                    case "CALL_DECLINE":
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

    // ====== 2. Hành động ======
    const startCall = () => {
        sendWebSocketMessage(`/app/call/${sessionId}`, {
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: receiverName,
            sessionId,
        });
        setIsCalling(true);
    };

    const acceptCall = () => {
        sendWebSocketMessage(`/app/call/${sessionId}`, {
            type: "CALL_ACCEPT",
            sessionId,
            callerId: currentUserId,
        });
        setIncomingCall(null);
        navigate(`/user/video-call/${sessionId}`);
    };

    const declineCall = () => {
        sendWebSocketMessage(`/app/call/${sessionId}`, {
            type: "CALL_DECLINE",
            sessionId,
            callerId: currentUserId,
        });
        setIncomingCall(null);
    };

    const cancelCall = () => {
        sendWebSocketMessage(`/app/call/${sessionId}`, {
            type: "CALL_CANCEL",
            sessionId,
            callerId: currentUserId,
        });
        setIsCalling(false);
    };

    // ====== 3. Chuông gọi ======
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
                <i className="bi bi-camera-video" style={{ fontSize: "1.5rem", color: "#016844ff" }}></i>
            </button>
        </>
    );
}
