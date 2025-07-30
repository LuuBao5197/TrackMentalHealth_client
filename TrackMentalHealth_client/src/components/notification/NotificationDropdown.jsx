import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

const NotificationDropdown = ({
    notifications,
    unreadNotifications,
    handleOpenNotificationDetail,
    handleDeleteNotification,
    maxLength = 50 // default truncate length
}) => {
    const truncateText = (text, length) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    return (
        <div className="dropdown">
            <button
                className="btn position-relative"
                type="button"
                data-bs-toggle="dropdown"
            >
                <FontAwesomeIcon icon={faBell} size="lg" />
                {unreadNotifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadNotifications.length}
                        <span className="visually-hidden">unread notifications</span>
                    </span>
                )}
            </button>

            <ul
                className="dropdown-menu dropdown-menu-end"
                style={{
                    minWidth: "300px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    cursor: "pointer"
                }}
            >
                {notifications.length === 0 ? (
                    <li className="dropdown-item text-muted">No new notifications</li>
                ) : (
                    notifications.map((noti, index) => (
                        <li
                            key={index}
                            className={`dropdown-item border-bottom ${!noti.read ? "fw-bold bg-light" : ""
                                }`}
                            style={{ position: "relative" }}
                        >
                            <div onClick={() => handleOpenNotificationDetail(noti)}>
                                <strong>{noti.title}</strong>
                                {!noti.read && (
                                    <span className="badge bg-primary ms-2">New</span>
                                )}
                                <div className="text-muted" style={{ fontSize: "12px" }}>
                                    {truncateText(noti.message, maxLength)}
                                </div>
                            </div>

                            <button
                                className="btn btn-sm position-absolute top-0 end-0 me-1 mt-1 p-0"
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    border: "1px solid #dc3545",
                                    backgroundColor: "transparent",
                                    color: "#dc3545",
                                    fontSize: "14px",
                                    lineHeight: "14px",
                                    textAlign: "center",
                                    transition: "background-color 0.2s ease"
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = "#f8d7da")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = "transparent")
                                }
                                onClick={() => handleDeleteNotification(noti.id)}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default NotificationDropdown;
