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
} from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getMessagesBySessionId } from "../../api/api";

function ChatWithUser() {
    const currentUserId = parseInt(getCurrentUserId());
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy receiver được truyền từ ChatList
    const preloadedReceiver = location.state?.receiver;

    const [messages, setMessages] = useState([]);
    const [receiverName, setReceiverName] = useState(preloadedReceiver?.fullname || "Đối phương");
    const [receiverId, setReceiverId] = useState(preloadedReceiver?.id || null);

useEffect(() => {
    const fetchMessages = async () => {
        try {
            const res = await getMessagesBySessionId(sessionId);

            if (res.length > 0) {
                const formatted = res.map(msg => ({
                    text: msg.message,
                    user: {
                        id: msg.sender.id.toString(),
                        name: msg.sender.id === currentUserId ? "Tôi" : (msg.sender.fullname || "Đối phương")
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

   const disconnect = connectWebSocket({
    sessionId, // phải có
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

    const handleSendMeetLink = () => {
        const meetLink = "Hãy tham gia cùng tôi: https://meet.google.com/ddo-ygdu-dcy";
        handleSendMessage(meetLink);
    };

    return (
        <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{ height: '100vh' }}>
                <MessageContainer>
                    <MessageHeader onBack={() => navigate("/auth/chat/list")}>
                        {receiverName}
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
                        onAttachClick={handleSendMeetLink}
                        disabled={!receiverId}
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}

export default ChatWithUser;
