import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { getChatGroupById, getMessagesByGroupId } from "../../api/api";
import { connectWebSocket, sendWebSocketMessage } from "../../services/stompClient";

function ChatGroup() {
    const currentUserId = getCurrentUserId();
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userMap, setUserMap] = useState({});
    const nav = useNavigate();

    useEffect(() => {
        const fetchGroupAndMessages = async () => {
            try {
                const groupRes = await getChatGroupById(groupId);
                setGroup(groupRes);

                const msgRes = await getMessagesByGroupId(groupId);
                const users = {};

                for (const msg of msgRes) {
                    const uid = msg.sender.id;
                    const member = groupRes.members.find(m => m.id === uid);
                    users[uid] = member?.fullname || "Người dùng";
                }

                const formatted = msgRes.map(m => ({
                    id: m.id,
                    text: m.content,
                    user: {
                        id: m.sender.id,
                        name: users[m.sender.id]
                    },
                    timestamp: new Date(m.sendAt).getTime()
                }));

                setUserMap(users);
                setMessages(formatted);
            } catch (err) {
                console.error("Lỗi tải nhóm hoặc tin nhắn:", err);
            }
        };

        fetchGroupAndMessages();
    }, [groupId]);

    // WebSocket kết nối nhận tin nhắn nhóm
    useEffect(() => {
        if (!groupId) return;

        const disconnect = connectWebSocket({
            groupId,
            onGroupMessage: (msg) => {
                const formatted = {
                    id: msg.id,
                    text: msg.content,
                    user: {
                        id: msg.sender.id,
                        name: msg.sender.fullname || "Người dùng"
                    },
                    timestamp: new Date(msg.sendAt).getTime()
                };
                setMessages(prev => [...prev, formatted]);
            }
        });

        return () => {
            disconnect();
        };
    }, [groupId]);

    // Gửi tin nhắn
   // Gửi tin nhắn
const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const now = Date.now();
    const localMsg = {
        id: `local-${now}`,
        text,
        user: {
            id: currentUserId,
            name: userMap[currentUserId] || "Bạn"
        },
        timestamp: now
    };

    // Hiển thị ngay
    setMessages(prev => [...prev, localMsg]);

    const messagePayload = {
        groupId,
        senderId: currentUserId,
        content: text
    };

    // Gửi qua WebSocket
    sendWebSocketMessage("/app/chat.group.send", messagePayload);
};


    return (
        <MinChatUiProvider theme="#68c790">
            <MainContainer style={{ height: "100vh" }}>
                <MessageContainer>
                  {group && (
    <MessageHeader onBack={() => nav('/auth/chat/list')}>
        <div className="d-flex justify-content-between align-items-start w-100">
            {/* Bên trái: Tên group + creator */}
            <div className="d-flex flex-column">
                <strong>{group.name}</strong>
                <small className="text-muted">
                    Creator: <u>{group.createdBy.fullname.toUpperCase()}</u>
                </small>
            </div>

            {/* Bên phải: Ngày tạo */}
            <div className="text-end">
                <small className="text-muted">
                    Created at: 
                    <u> {new Date(group.createdAt).toLocaleDateString('vi-VN')}</u>
                </small>
            </div>
        </div>
    </MessageHeader>
)}

                    <MessageList currentUserId={currentUserId} messages={messages} />
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
