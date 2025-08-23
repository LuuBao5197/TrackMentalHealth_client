import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";
import { sendWebSocketMessage, sendCallSignal } from "../../services/StompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";
import CallManager from "./CallManager";
import ToastTypes, { showToast } from "../../utils/showToast";
import { leaveRoom, destroyRoom } from "../../services/ZegoService";
import { WebSocketContext } from "../../layouts/user/UserLayout";

function ChatWithUser() {
    const { privateMessages, incomingCallSignal, setIncomingCallSignal } = useContext(WebSocketContext);
    const currentUserId = parseInt(getCurrentUserId());
    const [currentUserName, setCurrentUserName] = useState("USER");
    const [currentUserAvatar, setCurrentUserAvatar] = useState("");
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const preloadedReceiver = location.state?.receiver;

    const [messages, setMessages] = useState([]);
    const [receiverName, setReceiverName] = useState(preloadedReceiver?.fullname || "Đối phương");
    const [receiverId, setReceiverId] = useState(preloadedReceiver?.id || null);
    const [receiverAvatar, setReceiverAvatar] = useState(
        preloadedReceiver?.avatar?.trim()
            ? preloadedReceiver.avatar
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(preloadedReceiver?.fullname || "U")}`
    );

    // Lấy tin nhắn và thông tin người dùng
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await getMessagesBySessionId(sessionId);
                if (res.length > 0) {
                    const formatted = res.map(msg => ({
                        text: msg.message,
                        user: {
                            id: msg.sender.id.toString(),
                            name: msg.sender.id === currentUserId ? "Tôi" : (msg.sender.fullname || "Đối phương"),
                            avatar: msg.sender?.avatar?.trim()
                                ? msg.sender.avatar
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullname || "U")}`
                        }
                    }));
                    setMessages(formatted);

                    // Lưu thông tin người dùng hiện tại
                    const currentUserMsg = res.find(msg => msg.sender.id === currentUserId);
                    if (currentUserMsg) {
                        setCurrentUserName(currentUserMsg.sender.fullname || "Tôi");
                        setCurrentUserAvatar(
                            currentUserMsg.sender.avatar?.trim()
                                ? currentUserMsg.sender.avatar
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserMsg.sender.fullname || "U")}`
                        );
                    }

                    // Lấy thông tin người nhận nếu chưa có
                    if (!receiverId) {
                        const { sender, receiver } = res[0].session;
                        const isCurrentUserSender = sender.id === currentUserId;
                        const otherUser = isCurrentUserSender ? receiver : sender;

                        setReceiverName(otherUser.fullname || "Đối phương");
                        setReceiverId(otherUser.id);
                        setReceiverAvatar(
                            otherUser.avatar?.trim()
                                ? otherUser.avatar
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullname || "U")}`
                        );
                    }
                }
            } catch (error) {
                console.error("❌ Lỗi lấy tin nhắn:", error);
                showToast({
                    message: "Không thể tải tin nhắn. Vui lòng thử lại.",
                    type: ToastTypes.ERROR
                });
            }
        };

        fetchMessages();
    }, [sessionId, currentUserId, receiverId]);

    // Xử lý tin nhắn mới từ WebSocketContext
    useEffect(() => {
        if (privateMessages.length > 0) {
            const msg = privateMessages[privateMessages.length - 1];
            if (msg.sessionId === sessionId) {
                let avatarUrl;
                if (msg.senderAvatar?.trim()) {
                    avatarUrl = msg.senderAvatar;
                } else if (msg.senderId === currentUserId) {
                    avatarUrl = currentUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName || "U")}`;
                } else if (msg.senderId === receiverId) {
                    avatarUrl = receiverAvatar;
                } else {
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || "U")}`;
                }

                setMessages(prev => [
                    ...prev,
                    {
                        text: msg.message,
                        user: {
                            id: msg.senderId.toString(),
                            name: msg.senderId === currentUserId ? "Tôi" : (msg.senderName || "Đối phương"),
                            avatar: avatarUrl
                        }
                    }
                ]);
            }
        }
    }, [privateMessages, sessionId, currentUserId, receiverId, currentUserAvatar, currentUserName, receiverAvatar]);

    // Xử lý tín hiệu cuộc gọi từ WebSocketContext
    useEffect(() => {
        if (incomingCallSignal && incomingCallSignal.sessionId === sessionId) {
            switch (incomingCallSignal.type) {
                case "CALL_REQUEST":
                    if (incomingCallSignal.callerId !== currentUserId) {
                        showToast({
                            message: `Cuộc gọi từ ${incomingCallSignal.callerName}...`,
                            type: ToastTypes.INFO,
                            time: 15000,
                            showCallButtons: true,
                            position:'top-center',
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
                        showToast({
                            message: `${incomingCallSignal.receiverName} đã chấp nhận cuộc gọi`,
                            type: ToastTypes.SUCCESS
                        });
                    }
                    break;
                case "CALL_REJECTED":
                    showToast({
                        message: `${incomingCallSignal.receiverName || "Người nhận"} đã từ chối cuộc gọi`,
                        type: ToastTypes.WARNING
                    });
                    break;
                default:
                    console.log("Tín hiệu cuộc gọi không xác định:", incomingCallSignal);
            }
        }
    }, [incomingCallSignal, currentUserId, currentUserName, navigate, sessionId]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            leaveRoom();
            destroyRoom();
        };
    }, []);

    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        if (!receiverId) {
            console.warn("Không xác định được người nhận, không thể gửi tin nhắn");
            showToast({
                message: "Không thể gửi tin nhắn. Người nhận không xác định.",
                type: ToastTypes.ERROR
            });
            return;
        }

        sendWebSocketMessage(`/app/chat/${sessionId}`, {
            sender: { id: currentUserId },
            receiver: { id: receiverId },
            message: text,
            session: { id: sessionId }
        });
    };

    const handleStartVideoCall = () => {
        if (!sessionId) {
            console.error("🚫 callId/sessionId is missing");
            showToast({
                message: "Không thể bắt đầu cuộc gọi. Thiếu session ID.",
                type: ToastTypes.ERROR
            });
            return;
        }

        sendCallSignal(sessionId, {
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: currentUserName,
            sessionId
        });

        navigate(`/user/chat/video-call/${sessionId}`, {
            state: {
                currentUserId,
                currentUserName,
                isCaller: true,
            },
        });
    };

    return (
        <div className="container mt-3 mb-3">
            <MinChatUiProvider theme="#6ea9d7">
                <MainContainer style={{ height: '100vh' }}>
                    <MessageContainer>
                        <MessageHeader
                            onBack={() => navigate("/user/chat/list")}
                            avatar={receiverAvatar}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                justifyContent: "space-between",
                                position: "relative"
                            }}>
                                <span>{receiverName}</span>
                                <CallManager
                                    sessionId={sessionId}
                                    currentUserId={currentUserId}
                                    receiverName={receiverName}
                                />
                                <button
                                    onClick={handleStartVideoCall}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        position: "absolute",
                                        right: "10px"
                                    }}
                                    title="Video Call"
                                >
                                    <i className="bi bi-camera-video" style={{ fontSize: "1.5rem", color: "#1a73e8" }}></i>
                                </button>
                            </div>
                        </MessageHeader>

                        <MessageList
                            currentUserId={currentUserId.toString()}
                            messages={messages}
                        />

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