import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider,
} from "@minchat/react-chat-ui";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import {
    getChatGroupById,
    getMessagesByGroupId,
    initiateChatSession,
    findUsersByGroupId,
} from "../../api/api";
import { connectWebSocket, sendWebSocketMessage } from "../../services/stompClient";


function ChatGroup() {
    const currentUserId = getCurrentUserId();
    const { groupId } = useParams();
    const nav = useNavigate();

    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]); // Danh sách người khác trong group

    // Load group + messages + participants
    useEffect(() => {
        const fetchData = async () => {
            try {
                const groupRes = await getChatGroupById(groupId);
                setGroup(groupRes);

                const msgRes = await getMessagesByGroupId(groupId);
                setMessages(
                    msgRes.map((m) => ({
                        id: m.id,
                        text: m.content,
                        user: {
                            id: m.sender.id,
                            name: m.sender.fullname || "Người dùng",
                            avatar:
                                m.sender.avatar && m.sender.avatar.trim() !== ""
                                    ? m.sender.avatar
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(m.sender.fullname || "U")}`

                        },

                        timestamp: new Date(m.sendAt).getTime(),
                    }))
                );

                // Lấy danh sách user khác (loại trừ currentUser)
                const userList = await findUsersByGroupId(groupId, currentUserId);
                setParticipants(userList);
            } catch (err) {
                console.error("Lỗi tải dữ liệu nhóm:", err);
            }
        };
        fetchData();
    }, [groupId, currentUserId]);

    // WebSocket nhận tin nhắn mới
    useEffect(() => {
        if (!groupId) return;
        const disconnect = connectWebSocket({
            groupId,
            onGroupMessage: (msg) => {
                const senderId = msg.sender?.id ?? msg.senderId;

                setMessages((prev) => [
                    ...prev,
                    {
                        id: msg.id,
                        text: msg.content,
                        user: {
                            id: senderId,
                            name: msg.sender?.fullname ?? msg.senderName ?? "User",
                            avatar:
                                msg.sender?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    msg.sender?.fullname || "U"
                                )}`,
                        },
                        timestamp: new Date(msg.sendAt).getTime(),
                    },
                ]);
            },

        });
        return () => disconnect();
    }, [groupId]);

    // Gửi tin nhắn
    const handleSendMessage = (text) => {
        if (!text.trim()) return;
        sendWebSocketMessage("/app/chat.group.send", {
            groupId,
            senderId: currentUserId,
            content: text,
        });
    };

    // Mở chat riêng với user được chọn
    const openPrivateChat = async (userId) => {
        try {
            const session = await initiateChatSession(Number(currentUserId), Number(userId));
            if (session?.id) {
                nav(`/user/chat/${session.id}`);
            } else {
                alert("Không thể mở phiên chat riêng!");
            }
        } catch (error) {
            console.error("Lỗi tạo chat session:", error);
            alert("Có lỗi khi mở phiên chat riêng");
        }
    };

    return (
        <MinChatUiProvider theme="#68c790">
            <MainContainer style={{ height: "100vh" }}>
                <MessageContainer>
                    {group && (
                        <MessageHeader
                            onBack={() => nav("/user/chat/list")}
                            avatar={
                                group.avt && group.avt.trim() !== ""
                                    ? group.avt
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}`
                            }
                        >
                            <div className="d-flex flex-wrap justify-content-between align-items-center w-100">
                                {/* Trái: Tên nhóm + Creator + Dropdown thành viên */}
                                <div className="d-flex align-items-center gap-2">
                                    <div className="d-flex flex-column">
                                        <strong>{group.name}</strong>
                                        <small className="text-muted d-flex align-items-center gap-2">
                                            Creator: <u>{group.createdBy.fullname.toUpperCase()}</u>

                                            {/* Icon thành viên (dropdown) */}
                                            <div className="dropdown ms-2">
                                                <button
                                                    className="btn btn-link p-0 border-0"
                                                    type="button"
                                                    id="memberDropdown"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <i className="bi bi-people-fill" style={{ fontSize: "18px", color: 'black' }}></i>
                                                </button>
                                                <ul className="dropdown-menu" aria-labelledby="memberDropdown">
                                                    {participants.length > 0 ? (
                                                        participants.map((p) => (
                                                            <li
                                                                key={p.id}
                                                                className="dropdown-item d-flex align-items-center"
                                                                onClick={() => openPrivateChat(p.id)}
                                                            >
                                                                <img
                                                                    src={
                                                                        p.avatar && p.avatar.trim() !== ""
                                                                            ? p.avatar
                                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullname || "U")}`
                                                                    }
                                                                    alt="avatar"
                                                                    className="rounded-circle me-2"
                                                                    style={{ width: "24px", height: "24px" }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.fullname || "U")}`;
                                                                    }}
                                                                />
                                                                {p.fullname}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="dropdown-item text-muted text-center">No members yet</li>
                                                    )}
                                                </ul>

                                            </div>
                                        </small>
                                    </div>
                                </div>

                                {/* Phải: Ngày tạo */}
                                <div className="text-end mt-2 mt-sm-0">
                                    <small className="text-muted d-block">
                                        Created at: <u>{new Date(group.createdAt).toLocaleDateString("en-GB")}</u>
                                    </small>
                                </div>
                            </div>
                        </MessageHeader>

                    )}


                    {/* Danh sách tin nhắn */}
                    <MessageList currentUserId={currentUserId} messages={messages} />

                    {/* Ô nhập tin nhắn */}
                    <MessageInput
                        placeholder="Nhập tin nhắn..."
                        onSendMessage={handleSendMessage}
                        showSendButton
                        showAttachButton={false}
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}

export default ChatGroup;
