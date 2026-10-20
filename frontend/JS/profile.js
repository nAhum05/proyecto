// ---------- Notificaciones (SweetAlert2 con la paleta NIX) ----------

// Aviso pequeño que aparece arriba a la derecha y se va solo
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: { popup: 'swal-nix' },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Ventana central para errores y confirmaciones
const Modal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: 'swal-nix',
        confirmButton: 'swal-nix-confirm',
        cancelButton: 'swal-nix-cancel'
    }
});

function errorServidor() {
    return Modal.fire({
        icon: 'error',
        title: 'Sin conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonText: 'Entendido'
    });
}


// 1. Validar sesión
const token = localStorage.getItem('token');
const userStored = JSON.parse(localStorage.getItem('user'));

if (!token || !userStored) {
    window.location.href = 'login.html';
}


// 2. Cargar datos del perfil al entrar
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/user/${userStored.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar datos en pantalla
            document.getElementById('lblFirstName').textContent = data.firstName;
            document.getElementById('lblLastName').textContent = data.lastName || '';
            document.getElementById('lblEmail').textContent = data.email;
            document.getElementById('lblRole').textContent = data.role || 'usuario';

            // Mostrar las cajas para editar e insertar sus valores actuales
            document.getElementById('editSection').style.display = 'block';
            document.getElementById('dangerSection').style.display = 'block';

            document.getElementById('editFirstName').value = data.firstName;
            document.getElementById('editLastName').value = data.lastName || '';
        } else {
            Modal.fire({
                icon: 'error',
                title: 'No se pudo cargar',
                text: data.message || 'Error al obtener el perfil',
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error de red:', error);
        errorServidor();
    }
});


// 3. Guardar cambios del perfil
document.getElementById('formUpdateProfile').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;

    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ firstName, lastName })
        });

        const data = await response.json();

        if (response.ok) {
            // Actualizar los datos guardados en LocalStorage
            userStored.firstName = firstName;
            userStored.lastName = lastName;
            localStorage.setItem('user', JSON.stringify(userStored));

            // Reflejar los cambios en pantalla sin recargar (así el aviso no se corta)
            document.getElementById('lblFirstName').textContent = firstName;
            document.getElementById('lblLastName').textContent = lastName;

            Toast.fire({
                icon: 'success',
                title: data.message || 'Perfil actualizado correctamente'
            });
        } else {
            Modal.fire({
                icon: 'error',
                title: 'No se pudo actualizar',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error de red:', error);
        errorServidor();
    }
});


// 4. Eliminar cuenta
document.getElementById('btnDeleteAccount').addEventListener('click', async () => {
    const confirmacion = await Modal.fire({
        icon: 'warning',
        title: '¿Eliminar tu cuenta?',
        text: 'Esta acción no se puede deshacer.',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
            popup: 'swal-nix',
            confirmButton: 'swal-nix-danger',
            cancelButton: 'swal-nix-cancel'
        }
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.clear();

            // Esperar a que el aviso termine y después salir
            await Toast.fire({
                icon: 'success',
                title: 'Cuenta eliminada',
                timer: 1800
            });

            window.location.href = 'login.html';
        } else {
            Modal.fire({
                icon: 'error',
                title: 'No se pudo eliminar',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error('Error de red:', error);
        errorServidor();
    }
});


// 5. Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', async (e) => {
    e.preventDefault();

    const confirmacion = await Modal.fire({
        icon: 'question',
        title: '¿Cerrar sesión?',
        showCancelButton: true,
        confirmButtonText: 'Salir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!confirmacion.isConfirmed) return;

    localStorage.clear();
    window.location.href = 'login.html';
});