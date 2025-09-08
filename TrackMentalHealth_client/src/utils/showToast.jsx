import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export function showToast(
  message = "",
  type = "info",
  {
    time = 3000,
    position = "bottom-right",
    closeButton = true,
    pauseOnHover = false,
    draggable = true,
    onAccept = null,
    onCancel = null,
    showCallButtons = false,
  } = {}
) {

  let toastId; // khai báo trước

  const content = (
    <div>
      <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4, color: "#fff" }}>
        New notification
      </div>
      {message && <div style={{ fontSize: 13 }}>{message}</div>}

      {showCallButtons && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            style={{ backgroundColor: "#4caf50", border: "none", padding: "6px 12px", color: "white", cursor: "pointer", borderRadius: 4 }}
            onClick={() => { if(onAccept) onAccept(); toast.dismiss(toastId); }}
          >
            Accept
          </button>
          <button
            style={{ backgroundColor: "#f44336", border: "none", padding: "6px 12px", color: "white", cursor: "pointer", borderRadius: 4 }}
            onClick={() => { if(onCancel) onCancel(); toast.dismiss(toastId); }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const options = {
    autoClose: showCallButtons ? false : time,
    position,
    closeButton,
    pauseOnHover,
    draggable,
  };

  // Gán toastId **sau khi tạo toast**
  switch (type) {
    case "success":
      toastId = toast.success(content, options);
      break;
    case "error":
      toastId = toast.error(content, options);
      break;
    case "warning":
      toastId = toast.warning(content, options);
      break;
    case "info":
    default:
      toastId = toast.info(content, options);
  }
}

