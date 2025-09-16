import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { sendCallSignal } from "../../../services/stompClient";
import { showToast } from "../../../utils/showToast";
import ringtone from "../../../assets/ringtone/ringtone.mp3";

const CallSignalListener = ({ signal, currentUserId }) => {
  const navigate = useNavigate();
  const toastIdRef = useRef(null);
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!signal || !currentUserId) return;

    console.log("📞Nhận tín hiệu call:", signal);

    switch (signal.type) {
      case "CALL_REQUEST":
        if (signal.calleeId === currentUserId) {
          // Bắt đầu chuông
          setIsRinging(true);
          if (audioRef.current) {
            audioRef.current.play().catch(() => console.log("Autoplay blocked"));
          }
          
          // tránh tạo nhiều toast trùng lặp
          if (!toast.isActive(toastIdRef.current)) {
            toastIdRef.current = toast.info(
              ({ closeToast }) => (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    📞 Incoming Video Call
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                    <strong>{signal.callerName}</strong> is calling...
                  </div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        // Dừng chuông
                        setIsRinging(false);
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        
                        sendCallSignal({
                          type: "CALL_ACCEPTED",
                          callerId: signal.callerId,
                          calleeId: currentUserId,
                          sessionId: signal.sessionId,
                        });
                        toast.dismiss(toastIdRef.current);
                        navigate(`/user/chat/video-call/${signal.sessionId}`, {
                          state: {
                            currentUserId,
                            currentUserName: signal.callerName || "User " + currentUserId,
                            isCaller: false,
                            calleeUserId: signal.callerId,
                          },
                        });
                      }}
                      className="btn btn-success btn-lg"
                      style={{ padding: '10px 20px', fontSize: '16px' }}
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => {
                        // Dừng chuông
                        setIsRinging(false);
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        
                        sendCallSignal({
                          type: "CALL_REJECTED",
                          callerId: signal.callerId,
                          calleeId: currentUserId,
                          sessionId: signal.sessionId,
                        });
                        toast.dismiss(toastIdRef.current);
                        showToast('Call rejected', 'info');
                      }}
                      className="btn btn-danger btn-lg"
                      style={{ padding: '10px 20px', fontSize: '16px' }}
                    >
                      ❌ Decline
                    </button>
                  </div>
                </div>
              ),
              {
                toastId: "incoming-call",
                position: "top-center",
                autoClose: false,
                draggable: false,
                closeButton: false,
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '15px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }
              }
            );
          }
        }
        break;

      case "CALL_ACCEPTED":
        // Dừng chuông
        setIsRinging(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        if (signal.callerId !== currentUserId) {
          toast.dismiss(toastIdRef.current);
          navigate(`/user/chat/video-call/${signal.sessionId}`, {
            state: {
              currentUserId,
              currentUserName: signal.callerName || "User " + currentUserId,
              isCaller: true,
              calleeUserId: signal.calleeId,
            },
          });
        }
        break;

      case "CALL_REJECTED":
        // Dừng chuông
        setIsRinging(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        toast.dismiss(toastIdRef.current);
        if (signal.callerId !== currentUserId) {
          showToast("Call was rejected", "warning");
        }
        break;

      case "CALL_ENDED":
        // Dừng chuông
        setIsRinging(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        toast.dismiss(toastIdRef.current);
        showToast("Call ended", "info");
        break;

      default:
        break;
    }
  }, [signal, currentUserId, navigate]);

  return (
    <>
      <audio 
        ref={audioRef} 
        loop 
        style={{ display: 'none' }}
      >
        <source src={ringtone} type="audio/mpeg" />
      </audio>
    </>
  );
};

export default CallSignalListener;
