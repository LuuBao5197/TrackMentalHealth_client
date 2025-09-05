import React from "react";
import { toast } from "react-toastify";

const ToastTypes = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
};

// Hàm showToast giờ có thể nhận thêm callbacks cho nút Accept/Cancel
export function showToast({
  message = "",
  type = ToastTypes.INFO,
  time = 3000,
  position = "bottom-right",
  closeButton = true,
  pauseOnHover = true,
  draggable = true,
  // Thêm 2 props callback cho accept/cancel
  onAccept = null,
  onCancel = null,
  showCallButtons = false, // nếu true thì hiện nút Accept/Cancel
}) {
  const content = (
    <div>
      <strong style={{ display: "block", marginBottom: 4 }}>{message}</strong>
      {/* <div>{message}</div> */}
      {showCallButtons && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            style={{
              backgroundColor: "#4caf50",
              border: "none",
              padding: "6px 12px",
              color: "white",
              cursor: "pointer",
              borderRadius: 4,
            }}
            onClick={() => {
              if (onAccept) onAccept();
              toast.dismiss(); // đóng toast sau khi bấm
            }}
          >
            Accept
          </button>
          <button
            style={{
              backgroundColor: "#f44336",
              border: "none",
              padding: "6px 12px",
              color: "white",
              cursor: "pointer",
              borderRadius: 4,
            }}
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss();
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const options = {
    autoClose: time,
    position,
    closeButton,
    pauseOnHover,
    draggable,
  };

  switch (type) {
    case ToastTypes.SUCCESS:
      toast.success(content, options);
      break;
    case ToastTypes.ERROR:
      toast.error(content, options);
      break;
    case ToastTypes.WARNING:
      toast.warning(content, options);
      break;
    case ToastTypes.INFO:
    default:
      toast.info(content, options);
  }
}

export default ToastTypes;
