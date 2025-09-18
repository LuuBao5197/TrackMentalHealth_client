import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider,
} from "@minchat/react-chat-ui";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import {
    getChatGroupById,
    getMessagesByGroupId,
    initiateChatSession,
    findUsersByGroupId,
} from "../../api/api";
import { sendWebSocketMessage } from "../../services/stompClient";
import { WebSocketContext } from "../../layouts/user/UserLayout";


function ChatGroup() {
    const { groupMessages } = useContext(WebSocketContext);
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
                               id: String(m.sender.id),
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

    // 🔹 Lắng nghe tin nhắn group từ WebSocketContext
    useEffect(() => {
        console.log("🔍 ChatGroup useEffect triggered:", {
            groupMessagesLength: groupMessages?.length,
            groupId,
            currentUserId
        });

        if (!groupMessages || groupMessages.length === 0) {
            console.log("❌ No group messages or empty array");
            return;
        }

        // Chỉ xử lý tin nhắn mới nhất để tránh lặp
        const latestMessage = groupMessages[groupMessages.length - 1];
        
        // Kiểm tra xem tin nhắn có thuộc group hiện tại không
        if (latestMessage.groupId != groupId) {
            console.log("❌ Latest message not for current group");
            return;
        }

        console.log("📩 Processing latest group message:", latestMessage);

        const senderId = latestMessage.sender?.id ?? latestMessage.senderId;
        const isCurrentUser = String(senderId) === String(currentUserId);

        setMessages((prev) => {
            // Kiểm tra trùng tin nhắn
            const exists = prev.some(m => 
                (m.id && latestMessage.id && m.id === latestMessage.id) || 
                (m.text === latestMessage.content && m.user.id === senderId.toString())
            );
            if (exists) {
                console.log("❌ Message already exists, skipping:", latestMessage);
                return prev;
            }

            // Nếu là tin nhắn của user hiện tại, thay thế tin nhắn tạm thời
            if (isCurrentUser) {
                console.log("🔄 Replacing temporary group message");
                return prev.map(m => 
                    m.isTemporary && m.text === latestMessage.content 
                        ? {
                            id: latestMessage.id,
                            text: latestMessage.content,
                            user: {
                                id: String(senderId),
                                name: latestMessage.sender?.fullname ?? latestMessage.senderName ?? "Bạn",
                                avatar: latestMessage.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(latestMessage.sender?.fullname || "Bạn")}`
                            },
                            timestamp: new Date(latestMessage.sendAt).getTime(),
                        }
                        : m
                );
            }

            // Tin nhắn từ người khác - thêm mới
            console.log("➕ Adding new group message from others");
            return [
                ...prev,
                {
                    id: latestMessage.id,
                    text: latestMessage.content,
                    user: {
                        id: String(senderId),
                        name: latestMessage.sender?.fullname ?? latestMessage.senderName ?? "User",
                        avatar: latestMessage.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(latestMessage.sender?.fullname || "U")}`
                    },
                    timestamp: new Date(latestMessage.sendAt).getTime(),
                },
            ];
        });
    }, [groupMessages, groupId, currentUserId]);

    // Gửi tin nhắn
    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        // 🚀 OPTIMISTIC UPDATE - Hiển thị tin nhắn ngay lập tức
        const tempMessage = {
            id: `temp_${Date.now()}_${Math.random()}`,
            text: text,
            user: {
                id: String(currentUserId),
                name: "Bạn", // Tạm thời dùng "Bạn" cho group
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent("Bạn")}`
            },
            timestamp: Date.now(),
            isTemporary: true // Đánh dấu tin nhắn tạm thời
        };

        // Thêm tin nhắn vào UI ngay lập tức
        setMessages(prev => [...prev, tempMessage]);

        // Gửi qua WebSocket
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

    const handleVideoCallGroup = () => {
        nav(`/user/chat/public-call`);
    };


    return (
        <div className="mt-3 mb-3">
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
                                    <button
                                        onClick={handleVideoCallGroup}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            position: "absolute",
                                            right: "10px"
                                        }}
                                        title="Video Call"
                                    >
                                        <i className="bi bi-camera-video" style={{ fontSize: "1.5rem", color: "#007936ff" }}></i>
                                    </button>
                                </div>
                            </MessageHeader>

                        )}


                        {/* Danh sách tin nhắn */}
<MessageList currentUserId={String(currentUserId)} messages={messages} />

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
        </div>

    );
}

export default ChatGroup;
