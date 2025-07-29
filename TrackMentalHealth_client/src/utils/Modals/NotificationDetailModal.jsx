import { Modal, Button } from "react-bootstrap";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";

const NotificationDetailModal = ({ show, onClose, notification }) => {
  if (!notification) return null;

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      {/* Header */}
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Modal.Title className="d-flex align-items-center gap-2 text-primary">
          <FontAwesomeIcon icon={faBell} />
          Notification Details
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body>
        {/* Time */}
        <div className="text-end mb-2">
          <small className="text-muted">
            {format(new Date(notification.datetime), "HH:mm - dd/MM/yyyy")}
          </small>
        </div>

        {/* Title */}
        <h5 className="fw-bold text-dark mb-2">
          {notification.title || "Untitled Notification"}
        </h5>

        {/* Message */}
        <p
          className="mb-0 p-3 rounded"
          style={{
            backgroundColor: "#f1f3f5",
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            fontSize: "15px",
          }}
        >
          {notification.message}
        </p>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          className="px-4 rounded-pill"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationDetailModal;
