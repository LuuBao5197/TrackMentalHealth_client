import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";
import {
    connectWebSocket,
    sendWebSocketMessage,
    sendCallSignal
} from "../../services/StompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";
import CallManager from "./CallManager";
import ToastTypes, { showToast } from "../../utils/showToast";
import { joinRoom, leaveRoom, destroyRoom } from "../../services/ZegoService";   // 🔹 Import Zego

function ChatWithUser() {
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

    const zegoCallContainer = useRef(null); // 🔹 Container để mount video call

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

                    // Lưu avatar & tên của mình
                    const currentUserMsg = res.find(msg => msg.sender.id === currentUserId);
                    if (currentUserMsg) {
                        setCurrentUserName(currentUserMsg.sender.fullname || "Tôi");
                        setCurrentUserAvatar(
                            currentUserMsg.sender.avatar?.trim()
                                ? currentUserMsg.sender.avatar
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserMsg.sender.fullname || "U")}`
                        );
                    }

                    // Nếu chưa có receiver từ state thì lấy từ session
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
            }
        };

        fetchMessages();

        const disconnect = connectWebSocket({
            sessionId,
            callId: sessionId,
            onPrivateMessage: (msg) => {
                if (!msg?.message || !msg?.senderId) return;

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
            },
            onCallSignal: (signal) => {
                switch (signal.type) {
                    case "CALL_REQUEST":
                        if (signal.callerId !== currentUserId) {
                            showToast({
                                message: `Cuộc gọi từ ${signal.callerName}...`,
                                type: ToastTypes.INFO,
                                time: 15000,
                                showCallButtons: true,
                                onAccept: () => {
                                    // Người nhận bấm Accept → join luôn
                                    navigate(`/user/chat/video-call/${signal.sessionId}`, {
                                        state: { currentUserId, currentUserName, isCaller: false }
                                    });

                                    // Gửi tín hiệu cho caller biết callee đã chấp nhận
                                    sendCallSignal(signal.sessionId, {
                                        type: "CALL_ACCEPTED",
                                        receiverId: currentUserId,
                                        receiverName: currentUserName,
                                        sessionId: signal.sessionId
                                    });
                                },
                                onCancel: () => sendCallSignal(signal.sessionId, {
                                    type: "CALL_REJECTED",
                                    receiverId: currentUserId,
                                    receiverName: currentUserName,
                                    sessionId: signal.sessionId
                                })
                            });
                        }
                        break;

                    case "CALL_ACCEPTED":
                        // Caller chỉ update UI thôi (caller đã vào room từ trước rồi)
                        if (signal.receiverId !== currentUserId) {
                            showToast({
                                message: `${signal.receiverName} đã chấp nhận cuộc gọi`,
                                type: ToastTypes.SUCCESS
                            });
                        }
                        break;

                    case "CALL_REJECTED":
                        showToast({
                            message: `${signal.receiverName || "Người nhận"} đã từ chối cuộc gọi`,
                            type: ToastTypes.WARNING
                        });
                        break;
                }
            }



        });

        return () => {
            if (disconnect) disconnect();
            leaveRoom();
            destroyRoom();
        };
    }, [sessionId, currentUserId, receiverId, currentUserAvatar, currentUserName, receiverAvatar]);

    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        if (!receiverId) {
            console.warn("Không xác định được người nhận, không thể gửi tin nhắn");
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
            return;
        }

        // Gửi tín hiệu mời gọi
        sendCallSignal(sessionId, {
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: currentUserName,
            sessionId
        });

        // ✅ Điều hướng sang trang VideoCallZego kèm state
        navigate(`/user/chat/video-call/${sessionId}`, {
            state: {
                currentUserId,
                currentUserName,
                isCaller: true,   // 👈 BẮT BUỘC
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
                            placeholder="Nhập tin nhắn..."
                            onSendMessage={handleSendMessage}
                            showSendButton
                            showAttachButton={true}
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
