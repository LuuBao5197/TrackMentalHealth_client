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
    findUsersByGroupId, // API mới để lấy danh sách user trong group trừ mình
} from "../../api/api";
import { connectWebSocket, sendWebSocketMessage } from "../../services/stompClient";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

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
                            name: msg.sender?.fullname ?? msg.senderName ?? "Người dùng",
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
                nav(`/auth/chat/${session.id}`);
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
                        <MessageHeader onBack={() => nav("/auth/chat/list")}>
                            <div className="d-flex flex-wrap justify-content-between align-items-center w-100">
                                {/* Group name + dropdown participants */}
                                <div className="d-flex flex-column">
                                    <strong>{group.name}</strong>
                                    <div className="d-flex align-items-center gap-3 flex-wrap mt-1">
                                        <small className="text-muted">
                                            Creator: <u>{group.createdBy.fullname.toUpperCase()}</u>
                                        </small>

                                        {/* Dropdown từ react-bootstrap */}
                                        <Dropdown className="ms-2">
                                            <Dropdown.Toggle
                                                as="span" // render ra span thay vì button
                                                className="small text-decoration-underline text-secondary"
                                                style={{ cursor: "pointer" }}
                                            >
                                                Other participants ({participants.length})
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu
                                                className="border-0 shadow-lg rounded-xl p-2 mt-1"
                                                style={{
                                                    maxHeight: "300px",
                                                    overflowY: "auto",
                                                    minWidth: "200px",
                                                    zIndex: 1055,
                                                }}
                                            >
                                                {participants.length > 0 ? (
                                                    participants.map((user) => (
                                                        <Dropdown.Item
                                                            key={user.id}
                                                            onClick={() => openPrivateChat(user.id)}
                                                            className="d-flex align-items-center gap-2 w-100"
                                                            style={{cursor:'pointer'}}
                                                        >
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}`}
                                                                alt={user.fullname}
                                                                className="rounded-circle"
                                                                width={24}
                                                                height={24}
                                                            />
                                                            <span>{user.fullname}</span>
                                                        </Dropdown.Item>

                                                    ))
                                                ) : (
                                                    <Dropdown.ItemText className="text-muted">
                                                        No other users
                                                    </Dropdown.ItemText>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>

                                    </div>
                                </div>

                                {/* Created date */}
                                <div className="text-end mt-2 mt-sm-0">
                                    <small className="text-muted d-block">
                                        Created at:{" "}
                                        <u>{new Date(group.createdAt).toLocaleDateString("en-GB")}</u>
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
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}

export default ChatGroup;
