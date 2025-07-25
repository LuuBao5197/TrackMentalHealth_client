export function createNotificationDTO(userId) {
    return {
        user: { id: userId },
        type: 'system',
        title: 'New notification',
        des: 'Có sự kiện mới bạn cần xem',
        message: 'Bạn có một cuộc hẹn mới từ bác sĩ.',
        datetime: new Date().toISOString(),
        isRead: false
    };
}
