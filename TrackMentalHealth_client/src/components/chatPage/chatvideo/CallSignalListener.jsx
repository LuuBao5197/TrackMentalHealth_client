import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { sendCallSignal } from "../../../services/stompClient";
import { showToast } from "../../../utils/showToast";

const CallSignalListener = ({ signal, currentUserId }) => {
  const navigate = useNavigate();
  const toastIdRef = useRef(null);

  useEffect(() => {
    if (!signal || !currentUserId) return;

    console.log("📞Nhận tín hiệu call:", signal);

    switch (signal.type) {
      case "CALL_REQUEST":
        if (signal.calleeId === currentUserId) {
          // tránh tạo nhiều toast trùng lặp
          if (!toast.isActive(toastIdRef.current)) {
            toastIdRef.current = toast.info(
              ({ closeToast }) => (
                <div>
                  <strong>{signal.callerName}</strong> is calling...
                  <div style={{ marginTop: 10, display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        sendCallSignal({
                          type: "CALL_ACCEPTED",
                          callerId: signal.callerId,
                          calleeId: currentUserId,
                          sessionId: signal.sessionId,
                        });
                        toast.dismiss(toastIdRef.current); // đóng hẳn toast
                        navigate(`/user/chat/video-call/${signal.sessionId}`, {
                          state: {
                            currentUserId,
                            currentUserName:
                              signal.callerName || "User " + currentUserId,
                            isCaller: false,
                          },
                        });
                      }}
                      className="btn btn-success btn-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        sendCallSignal({
                          type: "CALL_REJECTED",
                          callerId: signal.callerId,
                          calleeId: currentUserId,
                          sessionId: signal.sessionId,
                        });
                        toast.dismiss(toastIdRef.current); // đóng hẳn toast
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ),
              {
                toastId: "incoming-call", // đặt id để tránh toast trùng
                position: "top-center",
                autoClose: false,
                draggable: false,
                closeButton: false,
              }
            );
          }
        }
        break;

      case "CALL_ACCEPTED":
        if (signal.callerId !== currentUserId) {
          toast.dismiss(toastIdRef.current); // caller cũng đóng nếu callee accept
          navigate(`/user/chat/video-call/${signal.sessionId}`, {
            state: {
              currentUserId,
              currentUserName: signal.callerName || "User " + currentUserId,
              isCaller: true,
            },
          });
        }
        break;

      case "CALL_REJECTED":
        toast.dismiss(toastIdRef.current); // reject thì đóng toast luôn
        if (signal.callerId !== currentUserId) {
          showToast("Call was rejected", "warning");
          navigate(`/user/chat/${signal.sessionId}`);
        }
        break;

      case "CALL_ENDED":
        toast.dismiss(toastIdRef.current); // end thì đóng luôn
        showToast("Call ended", "info");
        navigate(`/user/chat/${signal.sessionId}`);
        break;

      default:
        break;
    }
  }, [signal, currentUserId, navigate]);

  return null;
};

export default CallSignalListener;
