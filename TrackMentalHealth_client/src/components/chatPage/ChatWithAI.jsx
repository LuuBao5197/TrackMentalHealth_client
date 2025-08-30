import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../utils/getCurrentUserID";
import { chatAI, getAIHistory } from "../../api/api";

function ChatWithAI_RCE() {
  const currentUserId = getCurrentUserId();
  const nav = useNavigate();
  const [messages, setMessages] = useState([
    {
      position: "left",
      type: "text",
      text: "Xin chào! Tôi là AI, ngày hôm nay bạn ổn chứ?",
      date: new Date(),
      title: "AI Doctor",
      avatar: "https://i.pravatar.cc/40?u=ai",
    },
  ]);
  const [input, setInput] = useState("");

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getAIHistory(currentUserId);
        const formattedHistory = history.map((h) => ({
          position: h.role === "ai" ? "left" : "right",
          type: "text",
          text: h.message,
          date: new Date(),
          title: h.role === "ai" ? "AI Doctor" : "You",
          avatar:
            h.role === "ai"
              ? "https://i.pravatar.cc/40?u=ai"
              : "https://i.pravatar.cc/40?u=you",
        }));
        setMessages((prev) => [...prev, ...formattedHistory]);
      } catch (err) {
        console.error("Lỗi load history:", err);
      }
    };
    fetchHistory();
  }, [currentUserId]);

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      position: "right",
      type: "text",
      text: input,
      date: new Date(),
      title: "You",
      avatar: "https://i.pravatar.cc/40?u=you",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const payload = { message: input, userId: currentUserId.toString() };
      const aiReply = await chatAI(payload);

      const aiMessage = {
        position: "left",
        type: "text",
        text: String(aiReply),
        date: new Date(),
        title: "AI Doctor",
        avatar: "https://i.pravatar.cc/40?u=ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI error:", err);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2">
        <button onClick={() => nav("/user/chat/list")}>⬅ Back</button>
        <h3>AI Psychologist</h3>
      </div>

      <div style={{ height: "70vh", overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, i) => (
          <MessageBox key={i} {...msg} />
        ))}
      </div>

      <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rightButtons={
            <Button
              color="white"
              backgroundColor="blue"
              text="Send"
              onClick={handleSend}
            />
          }
        />
      </div>
    </div>
  );
}

export default ChatWithAI_RCE;
