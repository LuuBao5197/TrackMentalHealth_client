export function createChatSessionDTO(senderId, receiverId) {
    return {
        sender: { id: senderId },
        receiver: { id: receiverId },
        startTime: new Date().toISOString(),
        endTime: null,
        status: true
    };
}
