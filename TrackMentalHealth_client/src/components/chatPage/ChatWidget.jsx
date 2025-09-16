// src/components/common/ChatWidget.jsx
import React, { useEffect } from "react";
import { Widget, addResponseMessage, addUserMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";

/**
 * ChatWidget tái sử dụng cho AI chat, 1-1 chat, group chat
 *
 * @param {string} title - tiêu đề chat box
 * @param {string} subtitle - mô tả nhỏ
 * @param {string} userId - ID người dùng hiện tại
 * @param {Array} messages - danh sách tin nhắn [{ senderId, message }]
 * @param {Function} onSendMessage - callback khi user gửi msg (message: string) => void
 * @param {string} greeting - câu chào ban đầu
 */
const ChatWidget = ({
  title = "Chat",
  subtitle = "",
  userId,
  messages = [],
  onSendMessage,
  greeting = "",
}) => {
  // load greeting & messages
  useEffect(() => {
    if (greeting) addResponseMessage(greeting);
  }, [greeting]);

  useEffect(() => {
    if (!messages.length) return;

    // clear UI (nếu bạn muốn reset trước khi render messages mới)
    document.querySelector(".rcw-conversation-container")?.remove();

    // render lại lịch sử messages
    messages.forEach((m) => {
      if (String(m.senderId) === String(userId)) {
        addUserMessage(m.message);
      } else {
        addResponseMessage(m.message);
      }
    });
  }, [messages, userId]);

  // handle user gửi msg
  const handleNewUserMessage = (msg) => {
    if (onSendMessage) onSendMessage(msg);
  };

  return (
    <Widget
      handleNewUserMessage={handleNewUserMessage}
      title={title}
      subtitle={subtitle}
      showCloseButton={true}
      fullScreenMode={false}
    />
  );
};

export default ChatWidget;
