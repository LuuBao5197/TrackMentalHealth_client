import React from "react";
import { Modal, Button } from "react-bootstrap";
import { format } from "date-fns";

const NotificationDetailModal = ({ show, onClose, notification }) => {
  if (!notification) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Notification Details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Timestamp */}
        <div className="mb-2 text-end">
          <small className="text-muted">
            {format(new Date(notification.datetime), "HH:mm - dd/MM/yyyy")}
          </small>
        </div>

        {/* Title */}
        <h5 className="fw-bold mb-3">
          {notification.title || "Untitled Notification"}
        </h5>

        {/* Message content */}
        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.6",
            fontSize: "15px",
            color: "#333",
          }}
        >
          {notification.message}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationDetailModal;
