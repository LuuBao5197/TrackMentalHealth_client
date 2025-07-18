import Swal from 'sweetalert2';

export async function showConfirm(message) {
    const result = await Swal.fire({
        title: 'Confirm',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
    });

    return result.isConfirmed;
}
