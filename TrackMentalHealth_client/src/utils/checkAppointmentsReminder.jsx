/**
 * Kiểm tra lịch hẹn và trả về danh sách reminder cần nhắc
 * @param {Array} appointments - danh sách appointments [{id, title, time}]
 * @param {Number} reminderBeforeMinutes - số phút trước giờ hẹn cần nhắc
 * @returns {Array} - danh sách appointments sắp tới cần nhắc
 */
export function checkAppointmentsReminder(appointments, reminderBeforeMinutes = 30) {
    if (!Array.isArray(appointments)) return [];

    const now = new Date();
    const upcoming = [];

    appointments.forEach(app => {
        if (!app.time) return;
        const appointmentTime = new Date(app.time);
        const diffMs = appointmentTime - now;
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes > 0 && diffMinutes <= reminderBeforeMinutes) {
            upcoming.push({
                ...app,
                minutesLeft: Math.round(diffMinutes)
            });
        }
    });

    return upcoming;
}
