import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";
import { sendWebSocketMessage, sendCallSignal, connectWebSocket, unsubscribe } from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";
import { showToast } from "../../utils/showToast";
import { leaveRoom, destroyRoom } from "../../services/AgoraService";
import { WebSocketContext } from "../../layouts/user/UserLayout";

function ChatWithUser() {
    const { privateMessages, setPrivateMessages, incomingCallSignal, setIncomingCallSignal } = useContext(WebSocketContext);
    const currentUserId = parseInt(getCurrentUserId());
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const preloadedReceiver = location.state?.receiver;
    console.log("🔍 Preloaded receiver:", preloadedReceiver);

    const [messages, setMessages] = useState([]);
    const [currentUserName, setCurrentUserName] = useState("Tôi");
    const [currentUserAvatar, setCurrentUserAvatar] = useState("");
    const [receiverId, setReceiverId] = useState(preloadedReceiver?.id || null);
    const [receiverName, setReceiverName] = useState(preloadedReceiver?.fullname || "Đối phương");
    const [receiverAvatar, setReceiverAvatar] = useState(
        preloadedReceiver?.avatar?.trim()
            ? preloadedReceiver.avatar
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(preloadedReceiver?.fullname || "U")}`
    );
    
    console.log("🔍 Initial receiver state:", { receiverId, receiverName, receiverAvatar });

    // 🔹 Load tin nhắn cũ
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await getMessagesBySessionId(sessionId);
                const formatted = res.map(msg => ({
                    id: msg.id || Date.now() + Math.random(),
                    text: msg.message,
                    user: {
                        id: msg.sender.id.toString(),
                        name: msg.sender.fullname || "Đối phương",
                        avatar: msg.sender.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.fullname || "U")}`
                    }
                }));
                setMessages(formatted);

                // Cập nhật thông tin user hiện tại
                const currentUserMsg = res.find(msg => msg.sender.id === currentUserId);
                if (currentUserMsg) {
                    setCurrentUserName(currentUserMsg.sender.fullname || "Tôi");
                    setCurrentUserAvatar(
                        currentUserMsg.sender.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserMsg.sender.fullname || "U")}`
                    );
                }

                // Cập nhật thông tin người nhận từ session data (ưu tiên hơn preloaded data)
                if (res.length > 0) {
                    const { sender, receiver } = res[0].session;
                    const otherUser = sender.id === currentUserId ? receiver : sender;
                    
                    // Luôn cập nhật thông tin từ session data để đảm bảo chính xác
                    setReceiverId(otherUser.id);
                    setReceiverName(otherUser.fullname || "Đối phương");
                    setReceiverAvatar(
                        otherUser.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullname || "U")}`
                    );
                    
                    console.log("🔍 Updated receiver info from session data:", {
                        id: otherUser.id,
                        fullname: otherUser.fullname,
                        avatar: otherUser.avatar
                    });
                } else if (!receiverId) {
                    // Nếu chưa có tin nhắn và chưa có receiverId, sử dụng preloaded data
                    console.log("🔍 No messages found, using preloaded receiver data:", preloadedReceiver);
                }
            } catch (err) {
                console.error("❌ Lỗi lấy tin nhắn:", err);
                showToast({ message: "Không thể tải tin nhắn", type: "error" });
            }
        };

        fetchMessages();
    }, [sessionId, currentUserId, receiverId]);

    // 🔹 Xử lý tin nhắn từ WebSocketContext
    useEffect(() => {
        if (!privateMessages || privateMessages.length === 0) return;

        // Lấy tin nhắn mới nhất
        const latestMessage = privateMessages[privateMessages.length - 1];
        
        // Kiểm tra xem tin nhắn có thuộc session hiện tại không
        if (latestMessage.sessionId && latestMessage.sessionId != sessionId) {
            console.log("🔍 Message not for current session, skipping:", latestMessage);
            return;
        }

        console.log("📩 ChatWithUser received private message from context:", latestMessage);
        
        // Kiểm tra trùng tin nhắn
        setMessages(prev => {
            // Kiểm tra trùng bằng ID (chỉ kiểm tra ID thật, không kiểm tra nội dung)
            const exists = prev.some(m => 
                m.id && latestMessage.id && m.id === latestMessage.id
            );
            if (exists) {
                console.log("❌ Message already exists, skipping:", latestMessage);
                return prev;
            }

            const isSenderCurrentUser = latestMessage.senderId == currentUserId;
            console.log("🔍 Sender check:", {
                messageSenderId: latestMessage.senderId,
                currentUserId,
                isSenderCurrentUser
            });

            // Nếu là tin nhắn của user hiện tại, thay thế tin nhắn tạm thời
            if (isSenderCurrentUser) {
                console.log("🔄 Replacing temporary message");
                console.log("🔍 Looking for temporary message with text:", latestMessage.message);
                console.log("🔍 Current messages:", prev.map(m => ({ id: m.id, text: m.text, isTemporary: m.isTemporary })));
                
                const updatedMessages = prev.map(m => {
                    if (m.isTemporary && m.text === latestMessage.message) {
                        console.log("✅ Found temporary message to replace:", m);
                        return {
                            id: latestMessage.id || Date.now() + Math.random(),
                            text: latestMessage.message,
                            user: {
                                id: latestMessage.senderId.toString(),
                                name: latestMessage.senderName,
                                avatar: currentUserAvatar
                            }
                        };
                    }
                    return m;
                });
                
                console.log("🔍 Updated messages:", updatedMessages.map(m => ({ id: m.id, text: m.text, isTemporary: m.isTemporary })));
                return updatedMessages;
            }

            // Tin nhắn từ người khác - thêm mới
            console.log("➕ Adding new message from others");
            return [
                ...prev,
                {
                    id: latestMessage.id || Date.now() + Math.random(),
                    text: latestMessage.message,
                    user: {
                        id: latestMessage.senderId.toString(),
                        name: latestMessage.senderName,
                        avatar: latestMessage.senderAvatar?.trim() || receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(latestMessage.senderName || "U")}`
                    }
                }
            ];
        });
    }, [privateMessages, sessionId, currentUserId, currentUserAvatar, receiverAvatar]);

    // Gửi tin nhắn ws
    const handleSendMessage = (text) => {
        if (!text.trim() || !receiverId) return;

        const tempMessage = {
            id: `temp_${Date.now()}_${Math.random()}`,
            text: text,
            user: {
                id: currentUserId.toString(),
                name: currentUserName,
                avatar: currentUserAvatar
            },
            isTemporary: true 
        };

        // Thêm tin nhắn vào UI ngay lập tức
        setMessages(prev => [...prev, tempMessage]);

        // Gửi qua WebSocket
        sendWebSocketMessage(`/app/chat/${sessionId}`, {
            sender: { id: currentUserId },
            receiver: { id: receiverId },
            message: text,
            session: { id: sessionId }
        });
    };

    const handleStartVideoCall = (calleeUserId) => {
        if (!calleeUserId) return;

        sendCallSignal({
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: currentUserName,
            calleeId:calleeUserId,
            sessionId, // vẫn giữ sessionId nếu cần xác định chat session
        });

        navigate(`/user/chat/video-call/${sessionId}`, {
            state: { currentUserId, currentUserName,calleeUserId, isCaller: true }
        });
    };


    return (
        <div className="container mt-3 mb-3">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item" style={{ cursor: "pointer", color: "#038238ff" }} onClick={() => navigate("/user/chat/list")}>Chat</li>
                    <li className="breadcrumb-item active" aria-current="page">Chat private</li>
                </ol>
            </nav>
            <MinChatUiProvider theme="#038238ff">
                <MainContainer style={{ height: '80vh' }}>
                    <MessageContainer>
                        <MessageHeader onBack={() => navigate("/user/chat/list")} avatar={receiverAvatar}>
                            <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between", position: "relative" }}>
                                <span>{receiverName}</span>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button
                                        onClick={() => handleStartVideoCall(receiverId)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                                        title="Video Call"
                                    >
                                        <i className="bi bi-camera-video" style={{ fontSize: "1.5rem", color: "#038238ff" }}></i>
                                    </button>
                                </div>
                            </div>
                        </MessageHeader>

                        <MessageList currentUserId={currentUserId.toString()} messages={messages} />

                        <MessageInput
                            placeholder="Enter message..."
                            onSendMessage={handleSendMessage}
                            showSendButton
                            showAttachButton={false}
                            onAttachClick={false}
                            disabled={!receiverId}
                        />
                    </MessageContainer>
                </MainContainer>
            </MinChatUiProvider>
        </div>
    );
}

export default ChatWithUser;
