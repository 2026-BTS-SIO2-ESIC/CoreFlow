import Swal from 'sweetalert2'

const dialogDefaults = {
    confirmButtonColor: '#0D9488',
    cancelButtonColor: '#94A3B8',
    reverseButtons: true,
    buttonsStyling: true,
}

export const swalToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
})

export const showSuccessAlert = ({ title, text }) =>
    Swal.fire({
        icon: 'success',
        title,
        text,
        ...dialogDefaults,
    })

export const showErrorAlert = ({ title, text }) =>
    Swal.fire({
        icon: 'error',
        title,
        text,
        ...dialogDefaults,
    })

export const showWarningAlert = ({ title, text }) =>
    Swal.fire({
        icon: 'warning',
        title,
        text,
        ...dialogDefaults,
    })

export const showInfoAlert = ({ title, text }) =>
    Swal.fire({
        icon: 'info',
        title,
        text,
        ...dialogDefaults,
    })

export const confirmAction = async ({
    title,
    text,
    icon = 'warning',
    confirmButtonText = 'Confirmer',
    cancelButtonText = 'Annuler',
}) => {
    const result = await Swal.fire({
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        ...dialogDefaults,
    })

    return result.isConfirmed
}
