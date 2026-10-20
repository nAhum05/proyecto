const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));


// ---------- Notificaciones (SweetAlert2 con la paleta NIX) ----------

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

            // Definir la acción exclusiva para el moderador (Activar o Banear)
            let nuevoEstado = 'activo';
            let accionEstado = 'Activar';
            let claseBtn = 'btn-success';

            if (u.status === 'activo') {
                nuevoEstado = 'baneado';
                accionEstado = 'Banear';
                claseBtn = 'btn-danger';
            } else { // Si está baneado
                nuevoEstado = 'activo';
                accionEstado = 'Activar';
                claseBtn = 'btn-success';
            }

            const ultimoLogin = u.ultimoInicioSesion ? new Date(u.ultimoInicioSesion).toLocaleString() : 'Nunca';
            const fechaBaneoFormato = u.fechaBaneo ? new Date(u.fechaBaneo).toLocaleString() : 'N/A';

            row.innerHTML = `
                <td>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.role)}</td>
                <td>${escapeHtml(u.status)}</td>
                <td><small class="text-muted">${ultimoLogin}</small></td>
                <td><small class="text-muted">${fechaBaneoFormato}</small></td>
                <td>
                    <button
                        class="btn btn-sm ${claseBtn}"
                        onclick="cambiarEstado('${escapeHtml(u._id)}', '${nuevoEstado}')">
                        ${accionEstado}
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

    const banear = status === 'baneado';

    const confirmacion = await Modal.fire({
        icon: 'warning',
        title: banear ? '¿Banear usuario?' : '¿Activar usuario?',
        text: banear
            ? 'El usuario no podrá realizar publicaciones.'
            : 'Vas a reactivar a este usuario.',
        showCancelButton: true,
        confirmButtonText: banear ? 'Sí, banear' : 'Sí, activar',
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

        cargarUsuarios();

    } catch (error) {
        console.error('Error:', error);
        errorServidor();
    }
}