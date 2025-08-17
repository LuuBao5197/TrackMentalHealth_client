import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';
import { connectWebSocket, sendCallSignal } from '../../../services/StompClient';

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
          // 📩 Caller gửi REQUEST -> callee sẽ thấy popup
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
                        navigate(`/user/chat/video-call/${sessionId}`, {
                          state: {
                            currentUserId,
                            currentUserName: "User " + currentUserId,
                            isCaller: false, // ✅ callee
                          },
                        });
                      }}
                      className="btn btn-success btn-sm"
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
                      className="btn btn-danger btn-sm"
                    >
                      Reject
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

          // 📩 Caller nhận được tín hiệu callee Accept
          case "CALL_ACCEPTED":
            if (signal.calleeId !== currentUserId) {
              navigate(`/user/chat/video-call/${sessionId}`, {
                state: {
                  currentUserId,
                  currentUserName: "User " + currentUserId,
                  isCaller: true, // ✅ caller
                },
              });
            }
            break;

          case "CALL_REJECTED":
            toast.warning("📵 Call was rejected");
            navigate(`/user/chat/${sessionId}`);
            break;

          case "CALL_ENDED":
            toast.info("📴 Call ended");
            navigate(`/user/chat/${sessionId}`);
            break;

          default:
            break;
        }
      }
    });

    return () => disconnect && disconnect();
  }, [sessionId, currentUserId, navigate]);

  return null;
};

export default CallSignalListener;
