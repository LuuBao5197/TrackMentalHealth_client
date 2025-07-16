class ChatMessageDTO {
    constructor(data = {}) {
        this.senderId = data.senderId?.toString() || "unknown";
        this.message = data.message || "";
        this.isRead = data.isRead ?? false;
    }
}

export default ChatMessageDTO;
