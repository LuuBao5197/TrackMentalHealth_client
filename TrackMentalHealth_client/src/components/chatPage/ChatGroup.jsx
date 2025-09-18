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
import { sendWebSocketMessage, connectWebSocket, unsubscribe } from "../../services/stompClient";
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

    // 🔹 Tạo WebSocket subscription riêng cho group này
    useEffect(() => {
        if (!groupId) return;

        console.log("🔍 ChatGroup connecting WebSocket for group:", groupId);

        const disconnect = connectWebSocket({
            groupId,
            onGroupMessage: (msg) => {
                console.log("📩 ChatGroup received group message:", msg);
                console.log("🔍 Message details:", {
                    groupId: msg.groupId,
                    currentGroupId: groupId,
                    senderId: msg.sender?.id ?? msg.senderId,
                    currentUserId: currentUserId,
                    content: msg.content
                });
                
                // Kiểm tra xem tin nhắn có thuộc group hiện tại không
                if (msg.groupId != groupId) {
                    console.log("❌ Message not for current group, skipping:", {
                        messageGroupId: msg.groupId,
                        currentGroupId: groupId
                    });
                    return;
                }

                const senderId = msg.sender?.id ?? msg.senderId;
                const isCurrentUser = String(senderId) === String(currentUserId);
                
                console.log("🔍 Sender check:", {
                    messageSenderId: senderId,
                    currentUserId: currentUserId,
                    isCurrentUser: isCurrentUser
                });

                setMessages((prev) => {
                    console.log("🔍 Current messages count:", prev.length);
                    console.log("🔍 Current messages:", prev.map(m => ({ id: m.id, text: m.text, isTemporary: m.isTemporary })));
                    
                    // Kiểm tra trùng tin nhắn - chỉ kiểm tra ID thật
                    const exists = prev.some(m => 
                        m.id && msg.id && m.id === msg.id
                    );
                    if (exists) {
                        console.log("❌ Message already exists (by ID), skipping:", msg);
                        return prev;
                    }

                    // Nếu là tin nhắn của user hiện tại, thay thế tin nhắn tạm thời
                    if (isCurrentUser) {
                        console.log("🔄 Replacing temporary group message");
                        console.log("🔍 Looking for temporary message with text:", msg.content);
                        
                        const updatedMessages = prev.map(m => {
                            if (m.isTemporary && m.text === msg.content) {
                                console.log("✅ Found temporary message to replace:", m);
                                return {
                                    id: msg.id,
                                    text: msg.content,
                                    user: {
                                        id: String(senderId),
                                        name: msg.sender?.fullname ?? msg.senderName ?? "Bạn",
                                        avatar: msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullname || "Bạn")}`
                                    },
                                    timestamp: new Date(msg.sendAt).getTime(),
                                };
                            }
                            return m;
                        });
                        
                        console.log("🔍 Updated messages after replacement:", updatedMessages.map(m => ({ id: m.id, text: m.text, isTemporary: m.isTemporary })));
                        return updatedMessages;
                    }

                    // Tin nhắn từ người khác - thêm mới
                    console.log("➕ Adding new group message from others");
                    const newMessage = {
                        id: msg.id,
                        text: msg.content,
                        user: {
                            id: String(senderId),
                            name: msg.sender?.fullname ?? msg.senderName ?? "User",
                            avatar: msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullname || "U")}`
                        },
                        timestamp: new Date(msg.sendAt).getTime(),
                    };
                    
                    console.log("🔍 New message to add:", newMessage);
                    const updatedMessages = [...prev, newMessage];
                    console.log("🔍 Final messages count:", updatedMessages.length);
                    
                    return updatedMessages;
                });
            }
        });

        return () => {
            console.log("🔍 ChatGroup disconnecting WebSocket");
            // Unsubscribe specific group subscription
            if (groupId) {
                unsubscribe(`/topic/group/${groupId}`);
            }
            disconnect();
        };
    }, [groupId, currentUserId]);

    // Gửi tin nhắn
    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        console.log("📤 Sending group message:", {
            groupId,
            senderId: currentUserId,
            content: text
        });

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

        console.log("🔍 Temporary message created:", tempMessage);

        // Thêm tin nhắn vào UI ngay lập tức
        setMessages(prev => {
            const updated = [...prev, tempMessage];
            console.log("🔍 Messages after adding temporary:", updated.length);
            return updated;
        });

        // Gửi qua WebSocket
        const messageData = {
            groupId,
            senderId: currentUserId,
            content: text,
        };
        
        console.log("📤 Sending WebSocket message:", messageData);
        sendWebSocketMessage("/app/chat.group.send", messageData);
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
