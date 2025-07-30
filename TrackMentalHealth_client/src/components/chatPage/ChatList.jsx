import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    changeStatusIsRead,
    changeStatusNotification,
    createNewGroup,
    deleteGroupById,
    deleteNotificationById,
    getAIHistory,
    getAllChatGroup,
    getChatGroupByCreatorId,
    getChatSessionsByUserId,
    getMessagesBySessionId,
    getNotificationsByUserId,
    getPsychologists,
    initiateChatSession,
    updateGroupById,
    uploadFile,
} from "../../api/api";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../utils/showAlert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { getCurrentUserId } from '../../utils/getCurrentUserID';
import '../../assets/css/chat.css';
import { showConfirm } from '../../utils/showConfirm';
import GroupModal from '../../utils/Modals/GroupModal';
import NotificationDetailModal from '../../utils/Modals/NotificationDetailModal';
import { connectWebSocket } from '../../services/stompClient';
import { MainContainer, MessageContainer, MessageHeader, MessageInput, MessageList, MinChatUiProvider } from '@minchat/react-chat-ui';
import { useSelector } from 'react-redux';

const getOtherUser = (session, currentUserId) =>
    session.sender.id === currentUserId ? session.receiver : session.sender;


function ChatList() {
    const user = useSelector((state) => state.auth); // lấy role
    // const currentUserId = parseInt(getCurrentUserId());
    const currentUserId = String(getCurrentUserId());
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
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    //AI

    const [messages, setMessages] = useState([
        {
            text: "Xin chào! Tôi là AI, ngày hôm nay bạn ổn chứ?",
            user: { id: "ai", name: "AI Doctor" },
        }
    ]);


    const fetchHistory = async () => {
        try {
            const history = await getAIHistory(currentUserId);

            const formattedHistory = history.map(h => {
                const role = String(h.role || "user").toLowerCase();
                return {
                    text: h.message,
                    user: {
                        id: role === "ai" ? "ai" : currentUserId,
                        name: role === "ai" ? "AI Doctor" : "You"
                    }
                };
            });
            setMessages(prev => [...prev, ...formattedHistory]);
        } catch (err) {
            console.error("Lỗi load history:", err);
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { text, user: { id: currentUserId, name: "You" } };
        setMessages(prev => [...prev, userMessage]);

        try {
            const payload = { message: text, userId: currentUserId };
            const aiReply = await chatAI(payload);

            const aiMessage = {
                text: String(aiReply),
                user: { id: "ai", name: "AI Doctor" }
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("Lỗi xử lý AI:", err);
            setMessages(prev => [...prev, {
                text: "Không thể phản hồi ngay bây giờ.",
                user: { id: "ai", name: "AI Doctor" }
            }]);
        }
    };

    useEffect(() => {
        if (!currentUserId) return;

        const fetchSessions = async () => {
            try {
                const res = await getChatSessionsByUserId(currentUserId);

                const sessionsWithLastMessage = await Promise.all(
                    res.map(async (session) => {
                        try {
                            const messages = await getMessagesBySessionId(session.id);
                            let latestMessage = "No message yet...";
                            let unreadCount = 0;
                            let timestamp = null;
                            let isLastMessageUnread = false;

                            if (messages && messages.length > 0) {
                                const lastMsg = messages[messages.length - 1];
                                latestMessage = lastMsg.message;
                                timestamp = lastMsg.timestamp || lastMsg.createdAt || null;

                                unreadCount = messages.filter(
                                    msg => !msg.isRead && msg.receiver?.id === currentUserId
                                ).length;

                                isLastMessageUnread = (
                                    !lastMsg.isRead &&
                                    lastMsg.receiver?.id === currentUserId
                                );
                            }

                            return {
                                ...session,
                                latestMessage,
                                unreadCount,
                                timestamp,
                                isLastMessageUnread,
                            };
                        } catch (msgErr) {
                            console.error(`❌ Lỗi khi tải tin nhắn cho session ${session.id}:`, msgErr);
                            return {
                                ...session,
                                latestMessage: "Không thể lấy tin nhắn.",
                                unreadCount: 0,
                                timestamp: null,
                                isLastMessageUnread: false,
                            };
                        }
                    })
                );

                setSessions(sessionsWithLastMessage);
            } catch (err) {
                console.error("❌ Lỗi tải danh sách session:", err);
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        const fetchNotifications = async () => {
            try {
                const data = await getNotificationsByUserId(currentUserId);
                setNotifications(data);
                const unread = Array.isArray(data) ? data.filter(n => !n.read) : [];
                setUnreadNotifications(unread);
            } catch (err) {
                console.error("❌ Lỗi khi lấy thông báo:", err);
            }
        };

        const fetchPsychologists = async () => {
            try {
                const data = await getPsychologists();
                setPsychologists(data);
            } catch (err) {
                console.error("❌ Lỗi khi lấy psychologist:", err);
            }
        };

        const fetchChatGroup = async () => {
            try {
                const data = await getAllChatGroup();
                setGroup(data);
            } catch (err) {
                console.error("❌ Lỗi khi lấy group:", err);
            }
        };

        const fetchChatGroupByCreatorId = async () => {
            try {
                const data = await getChatGroupByCreatorId(currentUserId);
                setmyGroup(data);
            } catch (err) {
                console.error("❌ Lỗi khi lấy group của tôi:", err);
            }
        };

        // Gọi các fetch ban đầu
        fetchNotifications();
        fetchSessions();
        fetchPsychologists();
        fetchChatGroup();
        fetchChatGroupByCreatorId();
        fetchHistory();

        // WebSocket
        const disconnect = connectWebSocket({
            sessionId: null,
            groupId: null,
            onPrivateMessage: (msg) => {
                if (!msg || !msg.message || !msg.senderName) return;

                toast.info(`New message from ${msg.senderName.toUpperCase()}`);

                // 👇 Kiểm tra nếu tin nhắn thuộc phiên hiện tại
                if (msg.session?.id === currentSessionId) {
                    setMessages(prev => [...prev, msg]);
                }

                if (msg.session?.id !== currentSessionId && msg.receiverId === currentUserId) {
                    // Nếu không phải session đang xem + là người nhận tin → cập nhật trạng thái unread
                    setUnreadMessages(prev => {
                        const sessionId = msg.session?.id;
                        const updated = { ...prev };
                        updated[sessionId] = (updated[sessionId] || 0) + 1;
                        return updated;
                    });
                }


                fetchSessions(); // Cập nhật danh sách session (ví dụ để update unread count)
            }
            ,
            onNotification: (notification) => {
                console.log("🔔 Nhận noti từ WebSocket:", notification);

                setNotifications(prev => [notification, ...prev]);

                if (!notification.read) {
                    setUnreadNotifications(prev => [notification, ...prev]);
                }

                toast.info(`🔔 ${notification.title}: ${notification.message}`, {
                    position: "top-right",
                    autoClose: 4000,
                });
            }
        });



        return () => {
            if (disconnect) disconnect();
        };
    }, [currentUserId]);


    const chatWithPsychologist = async (psychologistId) => {
        try {
            const data = await initiateChatSession(psychologistId, currentUserId);
            if (data.id) {
                navigate(`/user/chat/${data.id}`);
            } else {
                showAlert("No chat session exists. Please create one.", "warning");
            }
        } catch (err) {
            console.error(err);
            showAlert("Error fetching chat session.", "error");
        }
    };

    async function handleDeleteGroup(id) {
        try {
            const confirmed = await showConfirm("Are you sure you want to delete this group?");
            if (!confirmed) return;
            await deleteGroupById(id);
            toast.success('Group deleted successfully');
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
            setLoading(true); // Bắt đầu loading

            let avt = data.imageUrl || data.avt || null;

            if (data.file) {
                avt = await uploadFile(data.file);
            }

            const payload = {
                ...data,
                avt,
                createdBy: { id: currentUserId },
                members: [{ id: currentUserId }],
            };

            if (editingGroup) {
                const updatedGroup = await updateGroupById(editingGroup.id, payload);
                setmyGroup((prev) =>
                    prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group))
                );
                setGroup((prev) =>
                    prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group))
                );
                showAlert("Group updated!", "success");
            } else {
                const newGroup = await createNewGroup(payload);
                setmyGroup((prev) => [...prev, newGroup]);
                setGroup((prev) => [...prev, newGroup]);
                showAlert("Group created!", "success");
            }

            setShowModal(false);
        } catch (error) {
            showAlert("Đã có lỗi khi tạo/sửa nhóm", "error");
            console.error(error);
        } finally {
            setLoading(false); // Tắt loading dù thành công hay thất bại
        }
    };

    const handleOpenNotificationDetail = async (noti) => {
        setSelectedNotification(noti);
        setShowDetailModal(true);

        if (!noti.read) {
            await changeStatusNotification(noti.id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === noti.id ? { ...n, read: true } : n))
            );
            setUnreadNotifications((prev) =>
                prev.filter((n) => n.id !== noti.id)
            );

        }
    };

    const handleClick = async (session) => {
        const otherUser = getOtherUser(session, currentUserId);
        try {
            // Gọi API đánh dấu tin nhắn đã đọc
            await changeStatusIsRead(session.id, currentUserId);
            setUnreadCounts((prev) => ({
                ...prev,
                [session.id]: 0,
            }));
        } catch (err) {
            console.warn("Không thể cập nhật trạng thái isRead");
        }

        // Điều hướng sang khung chat, truyền receiver qua state
        navigate(`/user/chat/${session.id}`, {
            state: {
                receiver: otherUser
            }
        });
    };

    async function handleDeleteNotification(id) {
        try {
            const isConfirmed = await showConfirm('Are you sure?');

            if (isConfirmed) {
                await deleteNotificationById(id);
                // Cập nhật lại danh sách notification
                setNotifications((prev) => prev.filter((noti) => noti.id !== id));
                toast.success('Delete successfully');
            }
        } catch (e) {
            console.log('Error deleting notification:', e);
            showAlert('Failed to delete notification', 'danger');
        }
    }



    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary mb-0">Messenger</h2>

                <div className="d-flex gap-2">
                    {/* Nếu USER */}
                    {user?.role === 'USER' && (
                        <>
                            <button
                                onClick={() => navigate(`/user/appointment/${currentUserId}`)}
                                className="btn btn-outline-primary"
                            >
                                My Appointments
                            </button>

                            {/* Dropdown Chat */}
                            <div className="dropdown">
                                <button
                                    className="btn btn-outline-primary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    Chat with Psychologist
                                </button>
                                <ul className="dropdown-menu">
                                    {psychologists.length === 0 ? (
                                        <li>
                                            <span className="dropdown-item text-muted">
                                                No psychologist found
                                            </span>
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
                        </>
                    )}

                    {/* Nếu PSYCHO */}
                    {user?.role === 'PSYCHO' && (
                        <>
                            <button
                                onClick={() => navigate('/user/appointment/psychologist')}
                                className="btn btn-outline-success"
                            >
                                Manage Appointments
                            </button>
                        </>
                    )}

                    {/* Notification Bell */}
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
                                minWidth: '300px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                cursor: 'pointer'
                            }}
                        >
                            {notifications.length === 0 ? (
                                <li className="dropdown-item text-muted">No new notifications</li>
                            ) : (
                                notifications.map((noti, index) => (
                                    <li
                                        key={index}
                                        className={`dropdown-item border-bottom ${!noti.read ? 'fw-bold bg-light' : ''}`}
                                        style={{ position: 'relative' }}
                                    >
                                        <div onClick={() => handleOpenNotificationDetail(noti)}>
                                            <strong>{noti.title}</strong>
                                            {!noti.read && <span className="badge bg-primary ms-2">New</span>}
                                            <div className="text-muted" style={{ fontSize: '12px' }}>
                                                {noti.message}
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-sm position-absolute top-0 end-0 me-1 mt-1 p-0"
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: '1px solid #dc3545', // viền đỏ outline
                                                backgroundColor: 'transparent', // nền trong suốt
                                                color: '#dc3545', // chữ đỏ
                                                fontSize: '14px',
                                                lineHeight: '14px',
                                                textAlign: 'center',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8d7da')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            onClick={() => handleDeleteNotification(noti.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />

                                        </button>

                                    </li>
                                ))
                            )}
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
                    {sessions.length === 0 && (
                        <div className="text-center text-muted mt-3">No chat session yet.</div>
                    )}

                    <div className="list-group">
                        {sessions.map((session) => {
                            const isCurrentUserSender = session.sender.id === currentUserId;
                            const otherUser = isCurrentUserSender ? session.receiver : session.sender;

                            return (
                                <div
                                    key={session.id}
                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                                    onClick={() => handleClick(session)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {/* Avatar hình tròn */}
                                    <img
                                        src={otherUser.avatar || "/default-avatar.png"}
                                        alt="avatar"
                                        className="rounded-circle border"
                                        width="40"
                                        height="40"
                                    />

                                    {/* Nội dung bên trái */}
                                    <div className="flex-grow-1">
                                        <div className="fw-bold d-flex justify-content-between align-items-center">
                                            {otherUser.fullname.toUpperCase()}

                                            {session.timestamp && (
                                                <small className="text-muted ms-2">
                                                    {new Date(session.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </small>
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <p
                                                className={`mb-0 small flex-grow-1 ${session.unreadCount > 0 ? 'fw-bold text-dark' : 'text-muted'
                                                    }`}
                                            >
                                                {session.latestMessage}
                                            </p>

                                            {/* 📩 Hiển thị số tin chưa đọc bên cạnh message */}
                                            {session.unreadCount > 0 && (
                                                <span className="badge bg-danger rounded-pill ms-2">
                                                    {session.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );

                        })}
                    </div>

                    <hr className="my-3 border-top border-secondary" />

                    {myGroup.length === 0 ? (
                        <div className="text-center text-muted mt-3">
                            You don't have any groups yet. <br />
                            <button className="btn btn-outline-primary mt-2" onClick={handleOpenCreate}>
                                Create a group chat
                            </button>
                        </div>
                    ) : (
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
                                        <div
                                            className="d-flex align-items-center"
                                            onClick={() => navigate(`/user/chat/group/${grp.id}`)}
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
                                                    {/* SVG default avatar */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="white" width="20" height="20">
                                                        <path d="..." />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <strong>{grp.name}</strong>
                                                <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                                                    {grp.des || "No description"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ms-3 d-flex gap-2">
                                            <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEditGroup(grp)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteGroup(grp.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <hr className="my-3 border-top border-secondary" />

                    {group.length > 0 && (
                        <>
                            <h4 className="mt-4">Chat Group ({group.length})</h4>
                            <div className="list-group">
                                {group.map((grp) => (
                                    <div
                                        key={grp.id}
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                        onClick={() => navigate(`/user/chat/group/${grp.id}`)}
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
                onClick={() => setIsOpen(true)}
                // onClick={()=>navigate('/user/chat/ai')}
                className="chat-ai-button glow btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
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

            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        width: "350px",
                        height: "500px",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        background: "#fff",
                        zIndex: 9999
                    }}
                >
                    <MinChatUiProvider theme="#6ea9d7">
                        <MainContainer style={{ height: "100%" }}>
                            <MessageContainer>
                                <MessageHeader
                                    onBack={() => setIsOpen(false)}
                                >
                                    AI Psychologist
                                </MessageHeader>
                                <MessageList currentUserId={currentUserId} messages={messages} />
                                <MessageInput
                                    placeholder="Nhập tin nhắn..."
                                    onSendMessage={handleSendMessage}
                                    showSendButton
                                />
                            </MessageContainer>
                        </MainContainer>
                    </MinChatUiProvider>
                </div>
            )}

            <GroupModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                initialData={editingGroup}
            />

            <NotificationDetailModal
                show={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                notification={selectedNotification}
            />

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />

        </div>
    );
}

export default ChatList;
