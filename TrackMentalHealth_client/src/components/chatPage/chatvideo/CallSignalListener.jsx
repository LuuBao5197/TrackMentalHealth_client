import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { sendCallSignal } from "../../../services/stompClient";
import { showToast } from "../../../utils/showToast";
// import { AudioManager } from "../../../utils/audioManager"; // Tắt chuông
// import ringtone from "../../../assets/ringtone/ringtone.mp3"; // Tắt chuông

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
          // Bắt đầu chuông - ĐÃ TẮT CHUÔNG
          setIsRinging(true);
          // AudioManager.playRingtone(audioRef); // Tắt chuông
          
          // tránh tạo nhiều toast trùng lặp
          if (!toast.isActive(toastIdRef.current)) {
            toastIdRef.current = toast.info(
              ({ closeToast }) => (
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Incoming Video Call
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                    <strong>{signal.callerName}</strong> is calling...
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        // Dừng chuông - ĐÃ TẮT CHUÔNG
                        setIsRinging(false);
                        // AudioManager.stopAllRingtone(); // Tắt chuông
                        
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
                      className="btn btn-success"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        // Dừng chuông - ĐÃ TẮT CHUÔNG
                        setIsRinging(false);
                        // AudioManager.stopAllRingtone(); // Tắt chuông
                        
                        sendCallSignal({
                          type: "CALL_REJECTED",
                          callerId: signal.callerId,
                          calleeId: currentUserId,
                          sessionId: signal.sessionId,
                        });
                        toast.dismiss(toastIdRef.current);
                        showToast('Call rejected', 'info');
                      }}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Decline
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
                  background: 'linear-gradient(135deg, #4fd1c7 0%, #26d0ce 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  maxWidth: '320px',
                  padding: '16px',
                }
              }
            );
          }
        }
        break;

      case "CALL_ACCEPTED":
        // Dừng chuông - ĐÃ TẮT CHUÔNG
        setIsRinging(false);
        // AudioManager.stopAllRingtone(); // Tắt chuông
        
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
        // Dừng chuông - ĐÃ TẮT CHUÔNG
        setIsRinging(false);
        // AudioManager.stopAllRingtone(); // Tắt chuông
        
        toast.dismiss(toastIdRef.current);
        if (signal.callerId !== currentUserId) {
          showToast("Call was rejected", "warning");
        }
        break;

      case "CALL_ENDED":
        // Dừng chuông - ĐÃ TẮT CHUÔNG
        setIsRinging(false);
        // AudioManager.stopAllRingtone(); // Tắt chuông
        
        toast.dismiss(toastIdRef.current);
        showToast("Call ended by other party", "info");
        
        // Tự động quay về trang chat sau 2 giây
        setTimeout(() => {
          navigate(`/user/chat/${signal.sessionId}`);
        }, 2000);
        break;

      default:
        break;
    }
  }, [signal, currentUserId, navigate]);

  // ✅ Cleanup effect để clear signal khi component unmount
  useEffect(() => {
    return () => {
      // Clear toast khi component unmount
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      // Clear ringing state
      setIsRinging(false);
    };
  }, []);

  return (
    <>
      {/* Audio element đã bị xóa - TẮT CHUÔNG */}
      {/* <audio 
        ref={audioRef} 
        loop 
        style={{ display: 'none' }}
      >
        <source src={ringtone} type="audio/mpeg" />
      </audio> */}
    </>
  );
};

export default CallSignalListener;
