// CallSignalListener.jsx
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';

const CallSignalListener = ({ sessionId }) => {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(); 

  useEffect(() => {
    if (!sessionId || !currentUserId) return;

    const disconnect = connectWebSocket({
      sessionId,
      callId: sessionId,
      onCallSignal: (signal) => {
        console.log("📞 Nhận tín hiệu call:", signal);
        switch (signal.type) {
          case "CALL_REQUEST":
            if (signal.callerId !== currentUserId) {
              toast.info(({ closeToast }) => (
                <div>
                  <strong>{signal.callerName}</strong> is calling...
                  <div style={{ marginTop: 10, display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        sendCallSignal(sessionId, {
                          type: "CALL_ACCEPTED",
                          calleeId: currentUserId,
                          sessionId
                        });
                        closeToast();
                        navigate(`/user/video-call/${sessionId}`);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        sendCallSignal(sessionId, {
                          type: "CALL_REJECTED",
                          calleeId: currentUserId,
                          sessionId
                        });
                        closeToast();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ), {
                position: "top-center",
                autoClose: false,
                draggable: false,
                closeButton: false
              });
            }
            break;

          case "CALL_ACCEPTED":
            navigate(`/user/video-call/${sessionId}`);
            break;

          case "CALL_REJECTED":
            toast.warning("📵 Cuộc gọi đã bị từ chối");
            break;
        }
      }
    });

    return () => {
      if (disconnect) disconnect();
    };
  }, [sessionId, currentUserId]);

  return null;
};

export default CallSignalListener;
