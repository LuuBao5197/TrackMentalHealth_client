// ChatWidgetWrapper.jsx
import { Widget, addResponseMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";
import { useEffect } from "react";

const ChatWidgetWrapper = ({ messages, onSendMessage }) => {
  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.senderId === "ai") {
        addResponseMessage(last.message);
      }
    }
  }, [messages]);

  return (
    <Widget
      title="Chat AI"
      subtitle="Hỗ trợ tự động"
      handleNewUserMessage={onSendMessage}
    />
  );
};

export default ChatWidgetWrapper;
