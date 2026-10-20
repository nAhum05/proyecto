const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));


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

// Evita que un nombre con código HTML se ejecute dentro de la tabla
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


// Verificar que haya sesión
if (!token || !user) {
    window.location.href = 'login.html';
}


// Verificar que sea moderador o administrador
if (!['moderador', 'administrador'].includes(user.role)) {
    window.location.href = 'feed.html';
}


// Cargar usuarios al abrir la página
document.addEventListener('DOMContentLoaded', () => {

    cargarUsuarios();

    // Cerrar sesión (con confirmación)
    document.getElementById('logoutBtn').addEventListener('click', async () => {

        const confirmacion = await Modal.fire({
            icon: 'question',
            title: '¿Cerrar sesión?',
            showCancelButton: true,
            confirmButtonText: 'Salir',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!confirmacion.isConfirmed) return;

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = 'login.html';

    });

});


// Consultar usuarios
async function cargarUsuarios() {

    try {

        const response = await fetch(
            'http://localhost:5000/api/moderator/users',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const users = await response.json();

        if (!response.ok) {
            Modal.fire({
                icon: 'error',
                title: 'No se pudo cargar',
                text: users.message || 'Error al consultar usuarios',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const table = document.getElementById('usersTable');

        table.innerHTML = '';

        users.forEach(u => {

            const row = document.createElement('tr');

            const accion = u.status === 'activo'
                ? 'Suspender'
                : 'Activar';

            const nuevoEstado = u.status === 'activo'
                ? 'suspendido'
                : 'activo';

            row.innerHTML = `
                <td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.role)}</td>
                <td>${escapeHtml(u.status)}</td>
                <td>
                    <button
                        class="btn btn-sm ${u.status === 'activo' ? 'btn-danger' : 'btn-success'}"
                        onclick="cambiarEstado('${escapeHtml(u._id)}', '${nuevoEstado}')">
                        ${accion}
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error('Error:', error);

        errorServidor();

    }
}


// Cambiar estado del usuario
async function cambiarEstado(userId, status) {

    const suspender = status === 'suspendido';

    // Confirmación antes de cambiar el estado
    const confirmacion = await Modal.fire({
        icon: 'warning',
        title: suspender ? '¿Suspender usuario?' : '¿Activar usuario?',
        text: suspender
            ? 'Vas a suspender a este usuario.'
            : 'Vas a reactivar a este usuario.',
        showCancelButton: true,
        confirmButtonText: suspender ? 'Sí, suspender' : 'Sí, activar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (!confirmacion.isConfirmed) return;

    try {

        const response = await fetch(
            `http://localhost:5000/api/moderator/users/${userId}/status`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            Modal.fire({
                icon: 'error',
                title: 'No se pudo cambiar el estado',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        Toast.fire({
            icon: 'success',
            title: data.message || 'Estado actualizado correctamente'
        });

        // Volver a cargar la tabla
        cargarUsuarios();

    } catch (error) {

        console.error('Error:', error);

        errorServidor();

    }
}