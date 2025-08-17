import {
    MainContainer,
    MessageContainer,
    MessageHeader,
    MessageInput,
    MessageList,
    MinChatUiProvider
} from "@minchat/react-chat-ui";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { chatAI, getAIHistory } from "../../api/api";

function ChatWithAI() {
    const currentUserId = getCurrentUserId(); 
    const [messages, setMessages] = useState([
        {
            text: "Xin chào! Tôi là AI, ngày hôm nay bạn ổn chứ?",
            user: {id: "ai", name: "AI Doctor"},
        }
    ]);

    const nav = useNavigate();

    // 🔥 Load history khi mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getAIHistory(currentUserId);
                // Chuyển đổi data từ API sang định dạng của MinChat
                const formattedHistory = history.map(h => ({
                    text: h.message,
                    user: { id: h.role === 'ai' ? 'ai' : currentUserId, name: h.role === 'ai' ? 'AI Doctor' : 'You' }
                }));
                setMessages(prev => [...prev, ...formattedHistory]);
            } catch (err) {
                console.error("Lỗi load history:", err);
            }
        };
        fetchHistory();
    }, [currentUserId]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = {
            text: text,
            user: {id: currentUserId, name: "You"}
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            // Gọi API AI
            const payload = { message: text, userId: currentUserId.toString() };
            const aiReply = await chatAI(payload);

            const aiMessage = {
                text: String(aiReply),
                user: {id: "ai", name: "AI Doctor"}
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("Lỗi xử lý AI:", err);
            setMessages(prev => [...prev, {
                text: "Không thể phản hồi ngay bây giờ.",
                user: {id: "ai", name: "AI Doctor"}
            }]);
        }
    };

    return (
        <div className="container mt-3 mb-3">
             <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{height: '100vh'}}>
                <MessageContainer>
                    <MessageHeader onBack={() => nav('/user/chat/list')}>AI Psychologist</MessageHeader>
                    <MessageList currentUserId={currentUserId} messages={messages}/>
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

export default ChatWithAI;
