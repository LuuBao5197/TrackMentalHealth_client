import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    changeStatusIsRead,
    getMessagesBySessionId,
    getChatSessionsByUserId,
    getAllChatGroup,
    getChatGroupByCreatorId,
    getPsychologists,
    initiateChatSession,
    updateGroupById,
    createNewGroup,
    deleteGroupById,
    uploadFile,
} from "../../api/api";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../utils/showAlert";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import "../../assets/css/chat.css";
import { showConfirm } from "../../utils/showConfirm";
import GroupModal from "../../utils/Modals/GroupModal";
import NotificationDetailModal from "../../utils/Modals/NotificationDetailModal";
import { useSelector } from "react-redux";

import {
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
} from "mdb-react-ui-kit";
import { showToast } from "../../utils/showToast";
import { connectWebSocket } from "../../services/stompClient";

const getOtherUser = (session, currentUserId) =>
    session.sender.id === currentUserId ? session.receiver : session.sender;

function ChatPage() {
    const user = useSelector((state) => state.auth);
    const role = localStorage.getItem("currentUserRole");
    const currentUserId = getCurrentUserId();

    const [activeTab, setActiveTab] = useState("user");

    const [sessions, setSessions] = useState([]);
    const [group, setGroup] = useState([]);
    const [myGroup, setMyGroup] = useState([]);
    const [psychologists, setPsychologists] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    const [currentSessionMessages, setCurrentSessionMessages] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);

    // ====== Fetch data & websocket ======
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
                                    (msg) =>
                                        !msg.isRead && msg.receiver?.id === currentUserId
                                ).length;
                                isLastMessageUnread =
                                    !lastMsg.isRead && lastMsg.receiver?.id === currentUserId;
                            }

                            return {
                                ...session,
                                latestMessage,
                                unreadCount,
                                timestamp,
                                isLastMessageUnread,
                            };
                        } catch (msgErr) {
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
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        const fetchPsychologists = async () => {
            try {
                const data = await getPsychologists();
                setPsychologists(data);
            } catch (err) { }
        };

        const fetchChatGroup = async () => {
            try {
                const data = await getAllChatGroup();
                setGroup(data);
            } catch (err) { }
        };

        const fetchChatGroupByCreatorId = async () => {
            try {
                const data = await getChatGroupByCreatorId(currentUserId);
                setMyGroup(data);
            } catch (err) { }
        };

        fetchSessions();
        fetchPsychologists();
        fetchChatGroup();
        fetchChatGroupByCreatorId();

        const disconnect = connectWebSocket({
            sessionId: null,
            groupId: null,
            onPrivateMessage: (msg) => {
                if (!msg || !msg.message || !msg.senderName) return;
                toast.info(`New message from ${msg.senderName.toUpperCase()}`);
                if (msg.session?.id === currentSession?.id) {
                    setCurrentSessionMessages((prev) => [
                        ...prev,
                        { senderId: msg.senderId, message: msg.message },
                    ]);
                }
                fetchSessions();
            },
        });

        return () => {
            if (disconnect) disconnect();
        };
    }, [currentUserId, currentSession]);

    // ====== Handlers ======
    const handleClick = async (session) => {
        const otherUser = getOtherUser(session, currentUserId);
        try {
            await changeStatusIsRead(session.id, currentUserId);
            const messages = await getMessagesBySessionId(session.id);
            const formattedMessages = messages.map((msg) => ({
                senderId: msg.sender?.id || msg.senderId,
                message: msg.message,
            }));
            setCurrentSessionMessages(formattedMessages);
            setCurrentSession(session);
            navigate(`/user/chat/${session.id}`, { state: { otherUser } });
        } catch (err) {
            showAlert("Không thể tải tin nhắn.", "error");
        }
    };

    const chatWithPsychologist = async (psychologistId) => {
        try {
            const data = await initiateChatSession(psychologistId, currentUserId);
            if (data.id) {
                navigate(`/user/chat/${data.id}`);
            } else {
                showAlert("No chat session exists. Please create one.", "warning");
            }
        } catch (err) {
            showAlert("Error fetching chat session.", "error");
        }
    };

    const handleDeleteGroup = async (id) => {
        try {
            const confirmed = await showConfirm(
                "Are you sure you want to delete this group?"
            );
            if (!confirmed) return;
            await deleteGroupById(id);
            showToast("Group deleted!");
            setMyGroup((prev) => prev.filter((grp) => grp.id !== id));
            setGroup((prev) => prev.filter((grp) => grp.id !== id));
        } catch (err) {
            showAlert("An error occurred while deleting the group.", "error");
            console.log(err);
            
        }
    };

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
                setMyGroup((prev) =>
                    prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group))
                );
                setGroup((prev) =>
                    prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group))
                );
                showToast("Group updated!", 'success');
            } else {
                const newGroup = await createNewGroup(payload);
                setMyGroup((prev) => [...prev, newGroup]);
                setGroup((prev) => [...prev, newGroup]);
                showToast("Group created!",'success');
            }

            setShowModal(false);
        } catch (error) {
            showAlert("Đã có lỗi khi tạo/sửa nhóm", "error");
            console.error(error);
        } finally {
            setLoading(false); // Tắt loading dù thành công hay thất bại
        }
    };

    // ====== Render ======
    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0" style={{ color: '#038238ff' }}>Messenger</h2>

                <div className="d-flex gap-2">
                    {role === "PSYCHOLOGIST" ? (
                        <>
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => navigate("/user/appointment/psychologist")}
                            >
                                Appointment Management
                            </button>
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => navigate("/user/chat/public-call")}
                            >
                                Video
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/user/appointment/${currentUserId}`)}
                            >
                                My Appointment
                            </button>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate("/user/chat/public-call")}
                            >
                                Video Chat
                            </button>
                        </>
                    )}
                </div>
            </div>



            {/* Tabs header */}
            <MDBTabs fill className="mb-3" >
                <MDBTabsItem>
                    <MDBTabsLink
                        onClick={() => setActiveTab("user")}
                        active={activeTab === "user"}
                        style={{ color: '#038238ff' }}
                    >
                        User Chat
                    </MDBTabsLink>
                </MDBTabsItem>
                {role !== "PSYCHOLOGIST" && (
                    <MDBTabsItem>
                        <MDBTabsLink
                            onClick={() => setActiveTab("psy")}
                            active={activeTab === "psy"}
                            style={{ color: '#038238ff' }}
                        >
                            Psychologist Chat
                        </MDBTabsLink>
                    </MDBTabsItem>
                )}
                <MDBTabsItem>
                    <MDBTabsLink
                        onClick={() => setActiveTab("group")}
                        active={activeTab === "group"}
                        style={{ color: '#038238ff' }}
                    >
                        Groups chat
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>

            {/* Tabs content */}
            <MDBTabsContent>
                {/* User Chat */}
                <MDBTabsPane open={activeTab === "user"} className="mb-3">
                    {sessions.length === 0 && (
                        <div className="text-center text-muted mt-3">
                            No chat session yet.
                        </div>
                    )}
                    <div className="list-group">
                        {sessions.map((session) => {
                            const isCurrentUserSender = session.sender.id === currentUserId;
                            const otherUser = isCurrentUserSender
                                ? session.receiver
                                : session.sender;
                            return (
                                <div
                                    key={session.id}
                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                                    onClick={() => handleClick(session)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <img
                                        src={otherUser.avatar || "/default-avatar.png"}
                                        alt="avatar"
                                        className="rounded-circle border"
                                        width="40"
                                        height="40"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold d-flex justify-content-between align-items-center">
                                            {otherUser.fullname.toUpperCase()}
                                            {session.timestamp && (
                                                <small className="text-muted ms-2">
                                                    {new Date(session.timestamp).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </small>
                                            )}
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <p
                                                className={`mb-0 small flex-grow-1 ${session.unreadCount > 0
                                                    ? "fw-bold text-dark"
                                                    : "text-muted"
                                                    }`}
                                            >
                                                {session.latestMessage}
                                            </p>
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
                </MDBTabsPane>

                {/* Psychologist Chat */}
                <MDBTabsPane open={activeTab === "psy"} className="mb-3">
                    {psychologists.length === 0 ? (
                        <p className="text-muted">No psychologist found</p>
                    ) : (
                        <ul className="list-group">
                            {psychologists.map((p) => (
                                <li
                                    key={p.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <span>{p.usersID?.fullname || "No name"}</span>
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => chatWithPsychologist(p.usersID.id)}
                                    >
                                        Chat
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </MDBTabsPane>

                {/* Groups */}
                <MDBTabsPane open={activeTab === "group"} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5>My Groups ({myGroup.length})</h5>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={handleOpenCreate}
                        >
                            Create new group
                        </button>
                    </div>


                    {myGroup.map((grp) => (
                        <div
                            key={grp.id}
                            className="list-group-item d-flex justify-content-between align-items-center mb-3"
                        >
                            {/* --- Avatar + Info --- */}
                            <div
                                className="d-flex align-items-center flex-grow-1"
                                onClick={() => navigate(`/user/chat/group/${grp.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Avatar */}
                                <img
                                    src={grp.avt || "/default-group.png"}
                                    alt="group avatar"
                                    className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                {/* Info */}
                                <div>
                                    <strong>{grp.name}</strong>
                                    <p
                                        className="text-muted mb-0"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        {grp.des || "No description"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleEditGroup(grp)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteGroup(grp.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    <hr />
                    <h5>All Groups ({group.length})</h5>
                    {group.map((grp) => (
                        <div
                            key={grp.id}
                            className="list-group-item d-flex align-items-center mb-3"
                            onClick={() => navigate(`/user/chat/group/${grp.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={grp.avt || "/default-group.png"}
                                alt="group avatar"
                                className="rounded-circle me-2"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <div className="d-flex flex-column flex-grow-1">
                                <strong>{grp.name} ({grp.createdBy?.fullname})</strong>
                                <small className="text-muted">
                                    {grp.des || "No data"}
                                </small>
                            </div>

                        </div>

                    ))}
                </MDBTabsPane>

            </MDBTabsContent>

            {/* Modals */}
            <GroupModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                initialData={editingGroup}
            />

            <NotificationDetailModal
                show={false}
                onClose={() => { }}
                notification={null}
            />
        </div>
    );
}

export default ChatPage;
