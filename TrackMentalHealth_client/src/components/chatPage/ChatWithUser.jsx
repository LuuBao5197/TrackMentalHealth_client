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
import { sendWebSocketMessage, sendCallSignal, connectWebSocket } from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";
import CallManager from "./CallManager";
import { showToast } from "../../utils/showToast";
import { leaveRoom, destroyRoom } from "../../services/ZegoService";
import { WebSocketContext } from "../../layouts/user/UserLayout";

function ChatWithUser() {
    const { privateMessages, setPrivateMessages, incomingCallSignal, setIncomingCallSignal } = useContext(WebSocketContext);
    const currentUserId = parseInt(getCurrentUserId());
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const preloadedReceiver = location.state?.receiver;

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

                // Lấy thông tin người nhận nếu chưa có
                if (!receiverId && res.length > 0) {
                    const { sender, receiver } = res[0].session;
                    const otherUser = sender.id === currentUserId ? receiver : sender;
                    setReceiverId(otherUser.id);
                    setReceiverName(otherUser.fullname || "Đối phương");
                    setReceiverAvatar(
                        otherUser.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullname || "U")}`
                    );
                }
            } catch (err) {
                console.error("❌ Lỗi lấy tin nhắn:", err);
                showToast({ message: "Không thể tải tin nhắn", type: "error" });
            }
        };

        fetchMessages();
    }, [sessionId, currentUserId, receiverId]);

    // 🔹 Kết nối WebSocket và subscribe
useEffect(() => {
    const disconnect = connectWebSocket({
        sessionId,
        onMessageReceived: (msg) => {
            setMessages(prev => {
                const exists = prev.some(m => m.id === msg.id);
                if (exists) return prev;

                return [
                    ...prev,
                    {
                        id: msg.id || Date.now() + Math.random(),
                        text: msg.message,
                        user: {
                            id: msg.senderId.toString(),
                            name: msg.senderName,
                            avatar: msg.senderAvatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || "U")}`
                        }
                    }
                ];
            });

            setPrivateMessages(prev => [...prev, msg]);
        }
    });

    return () => disconnect();
}, [sessionId, setPrivateMessages]); // ❌ bỏ messages khỏi dependency


    // 🔹 Gửi tin nhắn (optimistic UI)
    const handleSendMessage = (text) => {
        if (!text.trim() || !receiverId) return;

        const tempId = Date.now() + Math.random();
        // Hiển thị ngay trên UI
        setMessages(prev => [
            ...prev,
            {
                id: tempId,
                text,
                user: { id: currentUserId.toString(), name: currentUserName, avatar: currentUserAvatar }
            }
        ]);

        sendWebSocketMessage(`/app/chat/${sessionId}`, {
            sender: { id: currentUserId },
            receiver: { id: receiverId },
            message: text,
            session: { id: sessionId }
        });
    };

    // 🔹 Xử lý tín hiệu cuộc gọi
    useEffect(() => {
        if (incomingCallSignal && incomingCallSignal.sessionId === sessionId) {
            switch (incomingCallSignal.type) {
                case "CALL_REQUEST":
                    if (incomingCallSignal.callerId !== currentUserId) {
                        showToast({
                            message: `Cuộc gọi từ ${incomingCallSignal.callerName}...`,
                            type: "info",
                            time: 15000,
                            showCallButtons: true,
                            position: 'top-center',
                            onAccept: () => {
                                setIncomingCallSignal(null);
                                navigate(`/user/chat/video-call/${incomingCallSignal.sessionId}`, {
                                    state: { currentUserId, currentUserName, isCaller: false }
                                });
                                sendCallSignal(incomingCallSignal.sessionId, {
                                    type: "CALL_ACCEPTED",
                                    receiverId: currentUserId,
                                    receiverName: currentUserName,
                                    sessionId: incomingCallSignal.sessionId
                                });
                            },
                            onCancel: () => {
                                setIncomingCallSignal(null);
                                sendCallSignal(incomingCallSignal.sessionId, {
                                    type: "CALL_REJECTED",
                                    receiverId: currentUserId,
                                    receiverName: currentUserName,
                                    sessionId: incomingCallSignal.sessionId
                                });
                            }
                        });
                    }
                    break;
                case "CALL_ACCEPTED":
                    if (incomingCallSignal.receiverId !== currentUserId) {
                        showToast({ message: `${incomingCallSignal.receiverName} đã chấp nhận cuộc gọi`, type: "success" });
                    }
                    break;
                case "CALL_REJECTED":
                    showToast({ message: `${incomingCallSignal.receiverName || "Người nhận"} đã từ chối cuộc gọi`, type: "warning" });
                    break;
                default:
                    console.log("Tín hiệu cuộc gọi không xác định:", incomingCallSignal);
            }
        }
    }, [incomingCallSignal, currentUserId, currentUserName, navigate, sessionId, setIncomingCallSignal]);

    // Cleanup
    useEffect(() => {
        return () => { leaveRoom(); destroyRoom(); };
    }, []);

    const handleStartVideoCall = () => {
        if (!sessionId) return;

        sendCallSignal(sessionId, {
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: currentUserName,
            sessionId
        });

        navigate(`/user/chat/video-call/${sessionId}`, {
            state: { currentUserId, currentUserName, isCaller: true }
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
                                <CallManager sessionId={sessionId} currentUserId={currentUserId} receiverName={receiverName} />
                                <button onClick={handleStartVideoCall} style={{ background: "transparent", border: "none", cursor: "pointer", position: "absolute", right: "10px" }} title="Video Call">
                                    <i className="bi bi-camera-video" style={{ fontSize: "1.5rem", color: "#038238ff" }}></i>
                                </button>
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
