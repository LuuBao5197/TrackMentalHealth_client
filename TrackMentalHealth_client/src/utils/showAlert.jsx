
import Swal from 'sweetalert2';
export const showAlert = (text, type) => {
    Swal.fire({
        icon: type, // 'success', 'error', 'warning', 'info', 'question'
        title: getTitle(type),
        text: text,
        confirmButtonText: 'OK'
    });
};

const getTitle = (type) => {
    switch(type) {
        case 'success':
            return 'Thành công';
        case 'error':
            return 'Lỗi';
        case 'warning':
            return 'Cảnh báo';
        case 'info':
            return 'Thông báo';
        case 'question':
            return 'Xác nhận';
        default:
            return '';
    }
};
