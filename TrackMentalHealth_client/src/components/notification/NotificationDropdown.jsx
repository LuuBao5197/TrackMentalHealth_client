import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrashAlt, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useMemo } from "react";

const NotificationDropdown = ({
  notifications = [],
  handleOpenNotificationDetail,
  handleDeleteNotification,
  maxLength = 50,
}) => {
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const truncate = (text, length) =>
    !text ? "" : text.length > length ? text.slice(0, length) + "..." : text;

  const isValidDate = (date) => date && !isNaN(new Date(date).getTime());

  // Filter & sort notifications
  const filtered = useMemo(() => {
    const sorted = [...notifications]
      .filter(noti => isValidDate(noti.datetime))
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    return filter === "unread" ? sorted.filter(n => !n.read) : sorted;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleFilterClick = (newFilter, e) => {
    e.stopPropagation();
    setFilter(newFilter);
    setShowFilterMenu(false);
  };

  return (
    <div className="dropdown">
      <button className="btn position-relative" type="button" data-bs-toggle="dropdown">
        <FontAwesomeIcon icon={faBell} size="lg" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      <ul
        className="dropdown-menu dropdown-menu-end p-2"
        style={{ minWidth: "300px", maxHeight: "300px", overflowY: "auto" }}
      >
        {/* Filter dropdown */}
        <li className="mb-2" style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1001 }}>
          <button
            className="btn btn-sm btn-outline-success w-100 d-flex justify-content-between align-items-center"
            onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
          >
            Filter: {filter === "all" ? "All" : "Unread"}
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
          {showFilterMenu && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1002 }}>
              <li className="list-group-item list-group-item-action" onClick={(e) => handleFilterClick("all", e)}>All</li>
              <li className="list-group-item list-group-item-action" onClick={(e) => handleFilterClick("unread", e)}>Unread</li>
            </ul>
          )}
        </li>

        {filtered.length === 0 ? (
          <li className="dropdown-item text-muted">No notifications</li>
        ) : (
          filtered.map(noti => (
            <li key={noti.id} className={`dropdown-item border-bottom ${!noti.read ? "fw-bold bg-light" : ""}`} style={{ position: "relative" }}>
              <div onClick={() => handleOpenNotificationDetail(noti)} style={{ cursor: 'pointer' }}>
                <strong>{noti.title || "Notification"}</strong>
                {!noti.read && <span className="badge bg-primary ms-2">New</span>}
                <div className="text-muted" style={{ fontSize: "12px" }}>{truncate(noti.message, maxLength)}</div>
                <div className="text-end text-muted" style={{ fontSize: "10px" }}>
                  {isValidDate(noti.datetime) ? new Date(noti.datetime).toLocaleString() : "Invalid Date"}
                </div>
              </div>
              <button
                className="btn btn-sm position-absolute top-0 end-0 me-1 mt-1 p-0"
                style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid #dc3545", backgroundColor: "transparent", color: "#dc3545", fontSize: "14px", lineHeight: "14px", textAlign: "center" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8d7da")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={(e) => { e.stopPropagation(); handleDeleteNotification(noti.id); }}
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
