import { useEffect, useState } from "react";
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
} from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";
import CallManager from "./CallManager";
import { ToastContainer } from "react-toastify";
import { toast } from 'react-toastify';


function ChatWithUser() {
    const currentUserId = parseInt(getCurrentUserId());
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const preloadedReceiver = location.state?.receiver;

    const [messages, setMessages] = useState([]);
    const [receiverName, setReceiverName] = useState(preloadedReceiver?.fullname || "Đối phương");
    const [receiverId, setReceiverId] = useState(preloadedReceiver?.id || null);

    // Trạng thái gọi đến
    const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerName }

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
                            avatar:
                                msg.sender?.avatar && msg.sender.avatar.trim() !== ""
                                    ? msg.sender.avatar
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullname || "U")}`
                        }
                    }));

                    setMessages(formatted);

                    if (!receiverId) {
                        const { sender, receiver } = res[0].session;
                        const isCurrentUserSender = sender.id === currentUserId;
                        const otherUser = isCurrentUserSender ? receiver : sender;

                        setReceiverName(otherUser.fullname || "Đối phương");
                        setReceiverId(otherUser.id);
                    }
                }
            } catch (err) {
                console.error("❌ Lỗi lấy tin nhắn:", err);
            }
        };

        fetchMessages();

        // Kết nối WebSocket
        const disconnect = connectWebSocket({
            sessionId,
            callId: sessionId, // subscribe topic call
            onPrivateMessage: (msg) => {
                if (!msg?.message || !msg?.senderId) return;

                setMessages(prev => [
                    ...prev,
                    {
                        text: msg.message,
                        user: {
                            id: msg.senderId.toString(),
                            name: msg.senderId === currentUserId ? "Tôi" : (msg.senderName || "Đối phương")
                        }
                    }
                ]);
            },
            onCallSignal: (signal) => {
                console.log("📞 Nhận tín hiệu call:", signal);
                switch (signal.type) {
                    case "CALL_REQUEST":
                        if (signal.callerId !== currentUserId) {
                            toast.info(({ closeToast }) => (
                                <div>
                                    <strong>{signal.callerName}</strong> đang gọi...
                                    <div style={{ marginTop: 10, display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => {
                                                sendCallSignal(sessionId, {
                                                    type: "CALL_ACCEPTED",
                                                    calleeId: currentUserId,
                                                    sessionId
                                                });
                                                closeToast();
                                                navigate(`/user/video-call/${sessionId}`);
                                            }}
                                            style={{ backgroundColor: "#4CAF50", color: "white", padding: "4px 10px", border: "none", borderRadius: "4px" }}
                                        >
                                            Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => {
                                                sendCallSignal(sessionId, {
                                                    type: "CALL_REJECTED",
                                                    calleeId: currentUserId,
                                                    sessionId
                                                });
                                                closeToast();
                                            }}
                                            style={{ backgroundColor: "#f44336", color: "white", padding: "4px 10px", border: "none", borderRadius: "4px" }}
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            ), {
                                position: "top-center",
                                autoClose: false,
                                closeOnClick: false,
                                draggable: false,
                                closeButton: false
                            });
                        }
                        break;

                    case "CALL_ACCEPTED":
                        navigate(`/user/video-call/${sessionId}`);
                        break;

                    case "CALL_REJECTED":
                        toast.warning("📵 Cuộc gọi đã bị từ chối");
                        break;

                    default:
                        break;
                }
            }
        });

        return () => {
            if (disconnect) disconnect();
        };
    }, [sessionId, currentUserId, receiverId]);

    const handleSendMessage = (text) => {
        if (!text.trim()) return;

        if (!receiverId) {
            console.warn("Không xác định được người nhận, không thể gửi tin nhắn");
            return;
        }

        const messageObj = {
            sender: { id: currentUserId },
            receiver: { id: receiverId },
            message: text,
            session: { id: sessionId }
        };
        console.log("📨 Sending message:", messageObj);

        sendWebSocketMessage(`/app/chat/${sessionId}`, messageObj);
    };

    // Gọi đi
    const handleStartVideoCall = () => {
        sendCallSignal(sessionId, {
            type: "CALL_REQUEST",
            callerId: currentUserId,
            callerName: receiverName,
            sessionId
        });
    };

    // Chấp nhận cuộc gọi đến
    const handleAcceptCall = () => {
        sendCallSignal(sessionId, {
            type: "CALL_ACCEPTED",
            calleeId: currentUserId,
            sessionId
        });
        navigate(`/user/video-call/${sessionId}`);
    };

    // Từ chối cuộc gọi đến
    const handleRejectCall = () => {
        sendCallSignal(sessionId, {
            type: "CALL_REJECTED",
            calleeId: currentUserId,
            sessionId
        });
        setIncomingCall(null);
    };

    return (
        <div className="container mt-3 mb-3">
            <MinChatUiProvider theme="#6ea9d7">
                <MainContainer style={{ height: '100vh' }}>
                    <MessageContainer>
                        <MessageHeader
                            onBack={() => navigate("/user/chat/list")}
                            avatar={
                                preloadedReceiver?.avatar && preloadedReceiver.avatar.trim() !== ""
                                    ? preloadedReceiver.avatar
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverName)}`
                            }
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

            {/* Popup báo cuộc gọi đến */}
            {/* {incomingCall && (
                <div className="incoming-call-popup">
                    <p>{incomingCall.callerName} đang gọi...</p>
                    <button onClick={handleAcceptCall}>Chấp nhận</button>
                    <button onClick={handleRejectCall}>Từ chối</button>
                </div>
            )} */}

            <ToastContainer />
        </div>

    );
}

export default ChatWithUser;
