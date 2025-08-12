import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/getCurrentUserID";
import { connectWebSocket, sendCallSignal } from "../../../services/stompClient";
import ToastTypes, { showToast } from "../../../utils/showToast";

export default function VideoCall() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const currentUserId = parseInt(getCurrentUserId());

  // Lấy isCaller từ query param ?caller=true
  const searchParams = new URLSearchParams(window.location.search);
  const isCaller = searchParams.get("caller") === "true";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [waiting, setWaiting] = useState(true); // trạng thái chờ
  const [incomingCall, setIncomingCall] = useState(false); // bên nhận call có cuộc gọi đến
  const [callAccepted, setCallAccepted] = useState(false); // call đã được accept
  const [countdown, setCountdown] = useState(15);

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const waitingTimeoutRef = useRef(null); // để lưu timeout hủy call

  const toggleMic = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(!micEnabled);
  };

  const toggleCam = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = !camEnabled;
    });
    setCamEnabled(!camEnabled);
  };

  const createPeerConnection = (isCallerFlag) => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendCallSignal(sessionId, { type: "candidate", data: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        if (event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else {
          const inboundStream = new MediaStream();
          inboundStream.addTrack(event.track);
          remoteVideoRef.current.srcObject = inboundStream;
        }
      }
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerConnection.current.iceConnectionState);
    };

    if (isCallerFlag) {
      peerConnection.current.onnegotiationneeded = async () => {
        try {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          sendCallSignal(sessionId, { type: "offer", data: offer });
          console.log("Offer sent");
        } catch (err) {
          console.error("Error creating offer:", err);
          showToast("Error creating offer", ToastTypes.ERROR, 3000);
        }
      };
    }
  };

  const startLocalStream = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.warn("Cannot get camera, trying audio only", err);
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } catch (err2) {
        console.error("Cannot get local audio stream", err2);
        showToast("Cannot access microphone or camera", ToastTypes.ERROR, 3000);
        navigate(`/user/chat/${sessionId}`);
        return false;
      }
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
    return true;
  };

  const endCall = (sendSignal = true) => {
    if (sendSignal) {
      sendCallSignal(sessionId, { type: "CALL_ENDED", senderId: currentUserId });
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if(waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = null;
    }

    navigate(`/user/chat/${sessionId}`);
  };

  // Người nhận bấm Accept cuộc gọi
  const acceptCall = async () => {
    setCallAccepted(true);
    setWaiting(false);
    setIncomingCall(false);
    setCountdown(0);

    sendCallSignal(sessionId, { type: "CALL_ACCEPTED", senderId: currentUserId });

    const started = await startLocalStream();
    if (!started) return endCall();

    createPeerConnection(false);

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    try {
      if (peerConnection.currentOffer) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(peerConnection.currentOffer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        sendCallSignal(sessionId, { type: "answer", data: answer });
        peerConnection.currentOffer = null;
      }
    } catch (err) {
      console.error("Error handling offer in acceptCall", err);
      showToast("Error accepting call", ToastTypes.ERROR, 3000);
      endCall();
    }
  };

  // Người nhận bấm Reject cuộc gọi
  const rejectCall = () => {
    sendCallSignal(sessionId, { type: "CALL_REJECTED", senderId: currentUserId });
    endCall(false);
  };

  // Đếm ngược timeout 15s khi đang chờ
 useEffect(() => {
  // Chỉ chạy countdown khi đang chờ bên kia trả lời (caller side) và chưa accept
  if (!waiting || callAccepted) {
    // Dừng countdown
    setCountdown(0);
    return;
  }

  if (countdown === 0) {
    showToast("No response, call automatically cancelled.", ToastTypes.WARNING, 3000);
    endCall(true);
    return;
  }

  const timer = setTimeout(() => {
    setCountdown((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [countdown, waiting, callAccepted]);


  // Kết nối WebSocket và xử lý tín hiệu call
  useEffect(() => {
    if (!sessionId || !currentUserId) return;

    const disconnect = connectWebSocket({
      callId: sessionId,
      onCallSignal: async (signal) => {
        switch (signal.type) {
          case "CALL_ENDED":
            showToast("Call ended.", ToastTypes.INFO, 3000);
            endCall(false);
            break;

          case "CALL_REQUEST":
            if (!isCaller) {
              setWaiting(true);
              setIncomingCall(true);
            }
            break;

          case "CALL_ACCEPTED":
            if (isCaller) {
              setCallAccepted(true);
              setWaiting(false);
              setIncomingCall(false);
              setCountdown(0);
              if(waitingTimeoutRef.current) {
                clearTimeout(waitingTimeoutRef.current);
                waitingTimeoutRef.current = null;
              }
            }
            break;

          case "CALL_REJECTED":
            if (isCaller) {
              showToast("Call rejected.", ToastTypes.INFO, 3000);
              endCall(false);
            }
            break;

          case "offer":
            if (!callAccepted) {
              setIncomingCall(true);
              setWaiting(true);
              peerConnection.currentOffer = signal.data;
            }
            break;

          case "answer":
            try {
              if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.data));
              }
              setWaiting(false);
            } catch (err) {
              console.error("Error setting remote answer", err);
              showToast("Error processing call answer", ToastTypes.ERROR, 3000);
            }
            break;

          case "candidate":
            if (peerConnection.current && signal.data) {
              try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.data));
              } catch (err) {
                console.error("Error adding ICE candidate", err);
              }
            }
            break;

          default:
            break;
        }
      },
    });

    return () => {
      if (disconnect) disconnect();
      endCall(false);
    };
  }, [sessionId, currentUserId, isCaller, callAccepted]);

  // Khi caller vào component thì gửi CALL_REQUEST, bắt đầu đếm ngược 15s chờ
  useEffect(() => {
    if (!isCaller) return;

    sendCallSignal(sessionId, { type: "CALL_REQUEST", senderId: currentUserId });
    setWaiting(true);
    setIncomingCall(false);
    setCallAccepted(false);
    setCountdown(15);

    // Timeout 15s auto hủy cuộc gọi
    waitingTimeoutRef.current = setTimeout(() => {
      showToast("No response, call automatically cancelled.", ToastTypes.WARNING, 3000);
      endCall(true);
    }, 15000);

    // cleanup khi unmount hoặc call ended
    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
    };
  }, [isCaller, sessionId, currentUserId]);

  // Khi call được accept (caller hoặc callee) thì khởi tạo localStream + peer connection và bắt đầu call thật
  useEffect(() => {
    const startCall = async () => {
      if (!callAccepted) return;

      const started = await startLocalStream();
      if (!started) return endCall();

      createPeerConnection(isCaller);

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    };

    startCall();
  }, [callAccepted, isCaller]);

  // Styles (giữ nguyên như của bạn)
  const styles = {
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "#000",
      overflow: "hidden",
      fontFamily: "Arial, sans-serif",
      color: "#fff",
      userSelect: "none",
      zIndex: 9999,
    },
    remoteVideo: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      backgroundColor: "#222",
      zIndex: 1,
    },
    localVideoWrapper: {
      position: "absolute",
      width: "160px",
      height: "213px",
      bottom: "20px",
      right: "20px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "3px solid white",
      boxShadow: "0 0 10px rgba(0,0,0,0.6)",
      backgroundColor: "#000",
      zIndex: 10,
      cursor: "move",
    },
    localVideo: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transform: camEnabled ? "none" : "scaleX(-1)",
      filter: camEnabled ? "none" : "grayscale(80%)",
    },
    controls: {
      position: "absolute",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "25px",
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: "12px 25px",
      borderRadius: "50px",
      alignItems: "center",
      zIndex: 20,
    },
    controlButton: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.2)",
      transition: "background-color 0.3s",
      userSelect: "none",
    },
    controlButtonActive: {
      backgroundColor: "#4caf50",
    },
    controlButtonDisabled: {
      backgroundColor: "#f44336",
    },
    incomingCallOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "30px",
      zIndex: 99999,
      padding: "0 30px",
      textAlign: "center",
    },
    incomingText: {
      fontSize: "28px",
      fontWeight: "700",
    },
    waitingOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "20px",
      zIndex: 99999,
      padding: "0 30px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      {/* Remote video fullscreen */}
      <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />

      {/* Local video small overlay */}
      <div style={styles.localVideoWrapper}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={styles.localVideo}
        />
      </div>

      {/* Controls */}
      {!waiting && callAccepted && (
        <div style={styles.controls}>
          <button
            onClick={toggleMic}
            style={{
              ...styles.controlButton,
              ...(micEnabled ? styles.controlButtonActive : styles.controlButtonDisabled),
            }}
            title={micEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {micEnabled ? "🎤" : "🔇"}
          </button>
          <button
            onClick={toggleCam}
            style={{
              ...styles.controlButton,
              ...(camEnabled ? styles.controlButtonActive : styles.controlButtonDisabled),
            }}
            title={camEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {camEnabled ? "📷" : "🚫"}
          </button>
          <button
            onClick={() => endCall(true)}
            style={{
              ...styles.controlButton,
              backgroundColor: "#f44336",
              color: "#fff",
            }}
            title="End call"
          >
            ✖️
          </button>
        </div>
      )}

      {/* Incoming call overlay */}
      {waiting && incomingCall && (
        <div style={styles.incomingCallOverlay}>
          <p style={styles.incomingText}>Incoming call, do you want to accept?</p>
          <div>
            <button
              onClick={acceptCall}
              style={{
                marginRight: "20px",
                padding: "14px 30px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              Accept
            </button>
            <button
              onClick={rejectCall}
              style={{
                padding: "14px 30px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Waiting overlay */}
      {waiting && !incomingCall && (
        <div style={styles.waitingOverlay}>
          <p>
            Waiting for the other party to answer... <br />
            (Auto cancel in <b>{countdown}</b> seconds)
          </p>
          <button
            onClick={() => endCall(true)}
            style={{
              padding: "14px 40px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "18px",
              marginTop: "15px",
            }}
          >
            Cancel Call
          </button>
        </div>
      )}
    </div>
  );
}
