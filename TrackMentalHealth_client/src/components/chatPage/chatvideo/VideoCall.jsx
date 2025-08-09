import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/getCurrentUserID";
import { connectWebSocket, sendCallSignal } from "../../../services/stompClient";

export default function VideoCall() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const currentUserId = getCurrentUserId();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    const [isInitiator, setIsInitiator] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);

    // ===== 1. Khởi tạo WebRTC =====
    useEffect(() => {
        let disconnectWS = null;

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                localStreamRef.current = stream;
            } catch (err) {
                if (err.name === "NotReadableError") {
                    setErrorMsg("Camera hoặc micro đang được ứng dụng khác sử dụng.");
                } else if (err.name === "NotAllowedError") {
                    setErrorMsg("Bạn đã từ chối quyền truy cập camera/micro.");
                } else {
                    setErrorMsg("Không thể truy cập camera/micro.");
                }
                console.error(err);
                return;
            }

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                ]
            });

            // Add local tracks
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

            // Remote stream
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            };

            // Gửi ICE Candidate qua WebSocket
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendCallSignal(sessionId, {
                        type: "candidate",
                        candidate: event.candidate
                    });
                }
            };

            peerConnectionRef.current = pc;

            // WebSocket signal
            disconnectWS = connectWebSocket({
                videoCallId: sessionId,
                onVideoSignal: async (signal) => {
                    console.log("📡 Nhận tín hiệu video:", signal);

                    if (signal.type === "offer") {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        sendVideoSignal(sessionId, { type: "answer", data: answer });
                    } else if (signal.type === "answer") {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                    } else if (signal.type === "candidate" && signal.candidate) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                        } catch (err) {
                            console.error("Lỗi add ICE:", err);
                        }
                    }
                }
            });
        };

        init();

        return () => {
            if (disconnectWS) disconnectWS();
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [sessionId]);

    // ===== 2. Bắt đầu gọi (tạo offer) =====
    const startCall = async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        setIsInitiator(true);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendVideoSignal(sessionId, {
            type: "offer",
            data: offer
        });
    };

    // ===== 3. Toggle Camera =====
    const toggleCamera = () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setCameraEnabled(videoTrack.enabled);
        }
    };

    // ===== 4. Toggle Micro =====
    const toggleMic = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setMicEnabled(audioTrack.enabled);
        }
    };

    // ===== 5. Kết thúc cuộc gọi =====
    const endCall = () => {
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        navigate("/user/chat/list");
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden"
        }}>
            {/* Remote video full screen */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                }}
            />

            {/* Local video góc phải */}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "200px",
                    borderRadius: "12px",
                    border: "2px solid #fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                }}
            />

            {/* Nút điều khiển */}
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "20px"
            }}>
                {!isInitiator && (
                    <button
                        onClick={startCall}
                        style={{
                            background: "#1a73e8",
                            color: "#fff",
                            border: "none",
                            padding: "12px 20px",
                            borderRadius: "30px",
                            fontSize: "16px",
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                        }}
                    >
                        Bắt đầu
                    </button>
                )}

                <button
                    onClick={toggleCamera}
                    style={{
                        background: cameraEnabled ? "#1a73e8" : "#757575",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "30px",
                        fontSize: "16px",
                        cursor: "pointer"
                    }}
                >
                    {cameraEnabled ? "Tắt Camera" : "Bật Camera"}
                </button>

                <button
                    onClick={toggleMic}
                    style={{
                        background: micEnabled ? "#1a73e8" : "#757575",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "30px",
                        fontSize: "16px",
                        cursor: "pointer"
                    }}
                >
                    {micEnabled ? "Tắt Micro" : "Bật Micro"}
                </button>

                <button
                    onClick={endCall}
                    style={{
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "30px",
                        fontSize: "16px",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                    }}
                >
                    Kết thúc
                </button>
            </div>

            {/* Hiện lỗi */}
            {errorMsg && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(255,0,0,0.8)",
                    color: "#fff",
                    padding: "15px 25px",
                    borderRadius: "8px",
                    fontSize: "16px"
                }}>
                    {errorMsg}
                </div>
            )}
        </div>
    );
}
