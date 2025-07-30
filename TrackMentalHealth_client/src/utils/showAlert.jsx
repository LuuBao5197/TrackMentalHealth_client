import Swal from 'sweetalert2';

const titles = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  question: 'Confirmation'
};

export const showAlert = (text, type) => {
  Swal.fire({
    icon: type,
    title: titles[type] || '',
    text,
    confirmButtonText: 'OK'
  });
};
