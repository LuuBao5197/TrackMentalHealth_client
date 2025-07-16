import React, { useEffect, useState } from 'react';
import {
    changeStatusNotification,
    createNewGroup,
    deleteGroupById,
    getAllChatGroup,
    getChatGroupByCreatorId,
    getChatSessionsByTwoUserId,
    getChatSessionsByUserId,
    getMessagesBySessionId,
    getNotificationsByUserId,
    getPsychologists,
    updateGroupById,
} from "../../api/api";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../utils/showAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { getCurrentUserId } from '../../utils/getCurrentUserID';
import '../../assets/css/chat.css';
import { showConfirm } from '../../utils/showConfirm';
import GroupModal from '../../utils/Modals/GroupModal';

function ChatList() {
    const currentUserId = parseInt(getCurrentUserId());
    const [sessions, setSessions] = useState([]);
    const [group, setGroup] = useState([]);
    const [myGroup, setmyGroup] = useState([]);
    const [psychologists, setPsychologists] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
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
                                return { ...session, latestMessage: "Không có tin nhắn gần đây..." };
                            }
                        } catch (msgErr) {
                            console.error(`Lỗi khi tải tin nhắn cho session ${session.id}:`, msgErr);
                            return { ...session, latestMessage: "Không thể lấy tin nhắn." };
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
                const unread = Array.isArray(data) ? data.filter(n => !n.read) : [];
                setUnreadNotifications(unread);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchChatGroup = async () => {
            try {
                const data = await getAllChatGroup();
                setGroup(data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchChatGroupByCreatorId = async () => {
            try {
                const data = await getChatGroupByCreatorId(currentUserId);
                setmyGroup(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNotifications();
        fetchSessions();
        fetchPsychologists();
        fetchChatGroup();
        fetchChatGroupByCreatorId();
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

    const handleClickNotification = (id) => () => {
        try {
            changeStatusNotification(id);
            navigate(`/`);
        } catch (err) {
            console.error(err);
            showAlert("Error changing status notification.", "error");
        }
    };

    async function handleDeleteGroup(id) {
        try {
            const confirmed = await showConfirm("Are you sure you want to delete this group?");
            if (!confirmed) return;
            await deleteGroupById(id);
            showAlert("Group deleted successfully!", "success");
            setmyGroup(prev => prev.filter(grp => grp.id !== id));
            setGroup(prev => prev.filter(grp => grp.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            showAlert(err.message || "An error occurred while deleting the group.", "error");
        }
    }

    const handleOpenCreate = () => {
        setEditingGroup(null);
        setShowModal(true);
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setShowModal(true);
    };

    const handleModalSubmit = async (data) => {
        try {
            if (editingGroup) {
                const updatedGroup = await updateGroupById(editingGroup.id, data);
                setmyGroup((prev) =>
                    prev.map((group) =>
                        group.id === editingGroup.id ? updatedGroup : group
                    )
                );
                setGroup((prev) =>
                    prev.map((group) =>
                        group.id === editingGroup.id ? updatedGroup : group
                    )
                );
                showAlert("Group updated!", "success");
            }
            else {
                const newGroup = await createNewGroup({
                    ...data,
                    createdBy: { id: currentUserId },
                    members: [{ id: currentUserId }]
                });
                showAlert("Group created!", "success");
                setmyGroup((prev) => [...prev, newGroup]);
                setGroup((prev) => [...prev, newGroup]);
            }

            setShowModal(false);
        } catch (error) {
            showAlert("Đã có lỗi khi tạo/sửa nhóm", "error");
            console.error(error);
        }
    };


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary mb-0">Messenger</h2>

                <div className="d-flex gap-2">
                    <button onClick={() => navigate(`/appointments/${currentUserId}`)} className="btn btn-outline-primary">
                        My Appointments
                    </button>

                    {/* Dropdown Chat */}
                    <div className="dropdown">
                        <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Chat with Psychologist
                        </button>
                        <ul className="dropdown-menu">
                            {psychologists.length === 0 ? (
                                <li><span className="dropdown-item text-muted">No psychologist found</span></li>
                            ) : (
                                psychologists.map((a) => (
                                    <li key={a.id}>
                                        <button className="dropdown-item" onClick={() => chatWithPsychologist(a.usersID.id)}>
                                            {a.usersID?.fullname || 'No name'}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Notification Bell */}
                    <div className="dropdown">
                        <button className="btn position-relative" type="button" data-bs-toggle="dropdown">
                            <FontAwesomeIcon icon={faBell} size="lg" />
                            {unreadNotifications.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {unreadNotifications.length}
                                    <span className="visually-hidden">unread notifications</span>
                                </span>
                            )}
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: '300px' }}>
                            {notifications.length === 0 ? (
                                <li className="dropdown-item text-muted">Không có thông báo mới</li>
                            ) : (
                                notifications.slice(0, 5).map((noti, index) => (
                                    <li key={index} className={`dropdown-item ${!noti.read ? 'fw-bold bg-light' : ''}`} onClick={handleClickNotification(noti.id)}>
                                        <div>
                                            <strong>{noti.title}</strong>
                                            {!noti.read && <span className="badge bg-warning ms-2">New</span>}
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '12px' }}>
                                            {noti.message}
                                        </div>
                                    </li>
                                ))
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-center text-primary" onClick={() => navigate('/notifications')}>
                                    Xem tất cả
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="d-flex justify-content-center align-items-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Chat 1-1 */}
            {!loading && !error && (
                <>
                    <div className="list-group">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                onClick={() => navigate(`/chat/${session.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                <div>
                                    <strong>{session.receiver.fullname}</strong>
                                    <p className="text-muted mb-0">{session.latestMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>


                    {myGroup.length > 0 && (
                        <>
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <h4>My Group ({myGroup.length})</h4>
                                <button className="btn btn-outline-primary" onClick={handleOpenCreate}>
                                    Add new group ?
                                </button>
                            </div>


                            <div className="list-group mt-2">
                                {myGroup.map((grp) => (
                                    <div
                                        key={grp.id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        {/* Phần click mở group */}
                                        <div
                                            className="d-flex align-items-center"
                                            onClick={() => navigate(`/chat/group/${grp.id}`)}
                                            style={{ cursor: "pointer", flex: 1 }}
                                        >
                                            {grp.avt ? (
                                                <img
                                                    src={grp.avt}
                                                    alt="avatar"
                                                    className="rounded-circle me-3 border"
                                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    {/* SVG avatar placeholder */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 512"
                                                        fill="white"
                                                        width="20"
                                                        height="20"
                                                    >
                                                        <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <strong>{grp.name}</strong>
                                                <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                                                    {grp.des || "Không có mô tả"}
                                                </p>
                                                <span className="badge bg-secondary">
                                                    {grp.members?.length}/{grp.maxMember} members
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nút Edit/Delete */}
                                        <div className="ms-3 d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => {
                                                    handleEditGroup(grp);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => {
                                                    handleDeleteGroup(grp.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {group.length > 0 && (
                        <>
                            <h4 className="mt-4">Chat Group ({group.length})</h4>
                            <div className="list-group">
                                {group.map((grp) => (
                                    <div
                                        key={grp.id}
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                        onClick={() => navigate(`/chat/group/${grp.id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="d-flex align-items-center"

                                        >
                                            {grp.avt ? (
                                                <img
                                                    src={grp.avt}
                                                    alt="avatar"
                                                    className="rounded-circle me-3 border"
                                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 640 512"
                                                        fill="white"
                                                        width="20"
                                                        height="20"
                                                    >
                                                        <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <strong>{grp.name}</strong>
                                                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                                                    {grp.des || "Không có mô tả"}
                                                </p>
                                                <span className="badge bg-secondary">
                                                    {grp.members?.length}/{grp.maxMember} members
                                                </span>
                                            </div>
                                        </div>
                                        <span className="badge bg-secondary">
                                            Creator: <span>{grp.createdBy?.fullname || "No data"}</span>
                                        </span>

                                    </div>
                                ))}

                            </div>
                        </>
                    )}
                </>
            )}

            {/* Nút Chat AI */}
            <button
                onClick={() => navigate('/auth/chatai')} className="chat-ai-button glow btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "64px",
                    height: "64px",
                    fontSize: "28px",
                    zIndex: 1050,
                    transition: "all 0.2s ease-in-out"
                }}
                title="Trò chuyện với AI"
                aria-label="Trò chuyện với AI"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 24 24">
                    <path d="M20 2H4a2 2 0 0 0-2 2v20l4-4h14a2 2 0 0 0 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
            </button>

            <GroupModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                initialData={editingGroup}
            />


        </div>
    );
}

export default ChatList;
