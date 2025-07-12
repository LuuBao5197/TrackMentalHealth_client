import React, {useEffect, useState} from 'react';
import {
    changeStatusNotification,
    getChatSessionsByTwoUserId,
    getChatSessionsByUserId,
    getMessagesBySessionId,
    getNotificationsByUserId,
    getPsychologists,
} from "../../api/api";
import {useNavigate} from "react-router-dom";
import {showAlert} from "../../utils/showAlert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBell} from '@fortawesome/free-regular-svg-icons';
import { getCurrentUserId } from '../../utils/getCurrentUserID';

function ChatList() {
    const currentUserId = getCurrentUserId();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [psychologists, setPsychologists] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await getChatSessionsByUserId(currentUserId);
                const sessionsWithLastMessage = await Promise.all(
                    res.map(async (session) => {
                        try {
                            const messageRes = await getMessagesBySessionId(session.id);
                            if (messageRes.data && messageRes.data.length > 0) {
                                return {
                                    ...session,
                                    latestMessage: messageRes.data[messageRes.data.length - 1].message
                                };
                            } else {
                                return {...session, latestMessage: "Không có tin nhắn gần đây..."};
                            }
                        } catch (msgErr) {
                            console.error(`Lỗi khi tải tin nhắn cho session ${session.id}:`, msgErr);
                            return {...session, latestMessage: "Không thể lấy tin nhắn."};
                        }
                    })
                );
                setSessions(sessionsWithLastMessage);
            } catch (err) {
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };
        const fetchPsychologists = async () => {
            try {
                const data = await getPsychologists();
                setPsychologists(data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchNotifications = async () => {
            try {
                const data = await getNotificationsByUserId(currentUserId);
                setNotifications(data);

                // Filter unread notifications
                const unread = Array.isArray(data) ? data.filter(n => n.read === false) : [];
                setUnreadNotifications(unread);

                console.log("All notifications:", data);
                console.log("Unread notifications:", unread);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNotifications();
        fetchSessions();
        fetchPsychologists();
    }, [currentUserId]);

    const chatWithPsychologist = async (psychologistId) => {
        try {
            const data = await getChatSessionsByTwoUserId(psychologistId, currentUserId);
            if (data.id) {
                navigate(`/chat/${data.id}`);
            } else {
                showAlert("No chat session exists. Please create one.", "warning");
            }
        } catch (err) {
            console.error(err);
            showAlert("Error fetching chat session.", "error");
        }
    };
    const handleClickNotification = (id) => {
        return () => {
            try {
                changeStatusNotification(id);
                navigate(`/`);
            } catch (err) {
                console.error(err);
                showAlert("Error changing status notification.", "error");
            }
        }
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary mb-0">Messenger</h2>

                <div className="d-flex gap-2">
                    <button
                        onClick={() => navigate(`/appointments/${currentUserId}`)}
                        className="btn btn-outline-primary"
                    >
                        My Appointments
                    </button>

                    <div className="dropdown">
                        <button
                            className="btn btn-outline-primary dropdown-toggle"
                            type="button"
                            id="chatDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Chat with Psychologist
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="chatDropdown">
                            {psychologists.length === 0 ? (
                                <li>
                                    <span className="dropdown-item text-muted">No psychologist found</span>
                                </li>
                            ) : (
                                psychologists.map((a) => (
                                    <li key={a.id}>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => chatWithPsychologist(a.usersID.id)}
                                        >
                                            {a.usersID?.fullname || 'No name'}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className="dropdown">
                        <button
                            className="btn position-relative"
                            type="button"
                            id="notificationDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <FontAwesomeIcon icon={faBell} size="lg"/>

                            {unreadNotifications.length > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                    style={{fontSize: '0.75rem'}}
                                >
                {unreadNotifications.length}
                                    <span className="visually-hidden">unread notifications</span>
            </span>
                            )}
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown"
                            style={{minWidth: '300px'}}>
                            {notifications.length === 0 ? (
                                <li className="dropdown-item text-muted">Không có thông báo mới</li>
                            ) : (
                                notifications.slice(0, 5).map((noti, index) => (
                                    <li
                                        key={index}
                                        className={`dropdown-item ${!noti.read ? 'fw-bold bg-light' : ''}`}
                                        onClick={handleClickNotification(noti.id)}
                                    >

                                        <div>
                                            <strong>{noti.title}</strong>
                                            {!noti.read && ( <span className="badge bg-warning ms-2">New</span>)}
                                        </div>

                                        {/* Nội dung thông báo */}
                                        <div className="text-muted" style={{fontSize: '12px'}}>
                                            {noti.message}
                                        </div>
                                    </li>

                                ))
                            )}
                            <li>
                                <hr className="dropdown-divider"/>
                            </li>
                            <li>
                                <button className="dropdown-item text-center text-primary"
                                        onClick={() => navigate('/notifications')}>
                                    Xem tất cả
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="d-flex justify-content-center align-items-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="list-group">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => navigate(`/chat/${session.id}`)}
                            style={{cursor: "pointer"}}
                        >
                            <div>
                                <strong>{session.receiver.fullname}</strong>
                                <p className="text-muted mb-0">{session.latestMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Button Chat AI */}
            <button
                onClick={() => navigate('/chatwithai')}
                className="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "64px",
                    height: "64px",
                    fontSize: "28px",
                    zIndex: 1050
                }}
                title="Trò chuyện với AI"
                aria-label="Trò chuyện với AI"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24">
                    <path d="M20 2H4a2 2 0 0 0-2 2v20l4-4h14a2 2 0 0 0 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            </button>
        </div>
    );
}

export default ChatList;
