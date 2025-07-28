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
                        <MessageHeader
                            onBack={() => nav("/auth/chat/list")}
                            avatar={
                                group.avt && group.avt.trim() !== ""
                                    ? group.avt
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}`
                            }
                        >
                            <div className="d-flex flex-wrap justify-content-between align-items-center w-100">
                                {/* Group avatar + name */}
                                <div className="d-flex align-items-center gap-2">
                                    {/* Hiển thị avatar nếu có */}

                                    <div className="d-flex flex-column">
                                        <strong>{group.name}</strong>
                                        <small className="text-muted">
                                            Creator: <u>{group.createdBy.fullname.toUpperCase()}</u>
                                        </small>
                                    </div>
                                </div>

                                {/* Created date */}
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
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}

export default ChatGroup;
