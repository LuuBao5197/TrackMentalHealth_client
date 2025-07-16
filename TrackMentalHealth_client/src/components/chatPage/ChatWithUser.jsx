import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";

import {connectWebSocket, sendWebSocketMessage} from "../../services/stompClient";
import { getCurrentUserId } from "../../utils/getCurrentUserID";

function ChatWithUser() {
    const currentUserId = getCurrentUserId();
    const { sessionId } = useParams(); // ID của phiên trò chuyện từ URL
    const [messages, setMessages] = useState([]);
    const [receiverName, setReceiverName] = useState("Đang tải..."); // Tên người kia

    const nav = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await getMessagesBySessionId(sessionId);
                console.log(res)

                const formatted = res
                    .filter(msg => msg?.id && msg?.message)
                    .map(msg => ({
                        text: msg.message,
                        user: {
                            id: msg.senderId.toString(),
                            name: msg.session.receiver.fullname,
                        }
                    }));

                const otherUser = res.find(
                    msg => msg.senderId.toString() !== currentUserId
                )?.session.receiver.fullname;
                setReceiverName(otherUser);
                setMessages(formatted);
            } catch (err) {
                console.error("Lỗi khi tải tin nhắn:", err);
            }
        };

        fetchMessages();

        const disconnect = connectWebSocket(sessionId, (msg) => {
            if (!msg || !msg.message || !msg.senderId) return;

            setMessages(prev => [...prev, {
                text: msg.message,
                user: {
                    id: msg.senderId.toString(),
                    name: msg.senderName || "Đối phương"
                }
            }]);

            if (msg.senderId.toString() !== currentUserId) {
                setReceiverName(msg.senderName || "Người dùng");
            }
        });

        return () => {
            if (disconnect) disconnect();
        };
    }, [sessionId]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Gửi qua WebSocket (nếu cần)
        sendWebSocketMessage(`/app/chat/${sessionId}`, {
            senderId: currentUserId,
            message: text,
            session: { id: sessionId }
        });

        const newMessage = new ChatMessageDTO({
            senderId: currentUserId,
            message: text,
            isRead: false
        });

        try {
            console.log("🚀 Gửi tin nhắn tới API:", newMessage);

            const res = await sendMessage(sessionId, newMessage);
            console.log("✅ Phản hồi từ server:", res);

            const data = res.data || res; // tuỳ thuộc vào structure của API

            const formatted = {
                text: data.message,
                user: {
                    id: data.senderId?.toString(),
                    name: data.session?.users?.fullname || "Tôi",
                }
            };
            setMessages(prev => [...prev, formatted]);
        } catch (err) {
            console.error("❌ Không gửi được tin nhắn:");

            if (err.response) {
                // 👉 Nếu lỗi từ server (status >= 400)
                console.error("🔴 Status:", err.response.status);         // ví dụ 403
                console.error("🔴 Headers:", err.response.headers);
                console.error("🔴 Response data:", err.response.data);    // chi tiết lỗi

                alert(
                    `Lỗi gửi tin nhắn:\n` +
                    `Status: ${err.response.status}\n` +
                    `Details: ${JSON.stringify(err.response.data, null, 2)}`
                );
            } else if (err.request) {
                // 👉 Nếu request được gửi nhưng không có response (network error)
                console.error("🛑 Request lỗi, không nhận được response:", err.request);
                alert("Lỗi mạng hoặc server không phản hồi.");
            } else {
                // 👉 Lỗi khác (ví dụ lỗi config Axios)
                console.error("⚠️ Lỗi không xác định:", err.message);
                alert(`Lỗi không xác định: ${err.message}`);
            }
        }
    };

    const handleSendMeetLink = () => {
        const meetLink = "Hãy tham gia cùng tôi: https://meet.google.com/ddo-ygdu-dcy";
        handleSendMessage(meetLink);
    };

    return (
        <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{ height: '100vh' }}>
                <MessageContainer>
                    <MessageHeader onBack={() => nav('/')}>
                        {receiverName}
                    </MessageHeader>

                    <MessageList
                        currentUserId={currentUserId}
                        messages={messages}
                    />

                    <div>
                        <div style={{ flex: 1 }}>
                            <MessageInput
                                placeholder="Nhập tin nhắn..."
                                onSendMessage={handleSendMessage}
                                showSendButton
                                showAttachButton={true}
                                onAttachClick={handleSendMeetLink}
                            />
                        </div>
                    </div>
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}

export default ChatWithUser;
