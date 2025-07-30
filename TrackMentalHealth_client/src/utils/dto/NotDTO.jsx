export function NotDTO(userId,msg) {
    return {
        user: { id: userId },
        type: 'system',
        title: 'New notification',
        des: 'There is a new event',
        message: msg,
        datetime: new Date().toISOString(),
        isRead: false
    };
}
