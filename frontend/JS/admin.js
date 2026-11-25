
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// ---------- Notificaciones NIX ----------

// Notificaciones pequeñas
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: {
        popup: 'swal-nix'
    },
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Ventanas centrales
const Modal = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: 'swal-nix',
        confirmButton: 'swal-nix-confirm',
        cancelButton: 'swal-nix-cancel'
    }
});

// Error de conexión
function errorServidor() {
    return Modal.fire({
        icon: 'error',
        title: 'Sin conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonText: 'Entendido'
    });
}

// Escapar contenido HTML
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


// ---------- Verificar sesión ----------

if (!token || !user) {
    window.location.href = 'login.html';
}

// Verificar que sea administrador
if (user && user.role !== 'administrador') {
    window.location.href = 'feed.html';
}


// ---------- Cargar todo al abrir ----------

document.addEventListener('DOMContentLoaded', () => {

    cargarStats();
    cargarUsuarios();
    cargarPosts();

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', async () => {

        const confirmacion = await Modal.fire({
            icon: 'question',
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir?',
            showCancelButton: true,
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!confirmacion.isConfirmed) return;

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        window.location.href = 'login.html';

    });

    // Eventos de las tablas
    document.getElementById('usersTable').addEventListener('click', (event) => {

        const button = event.target.closest('button[data-action]');

        if (!button) return;

        const userId = button.dataset.userId;
        const action = button.dataset.action;

        if (action === 'status') {
            cambiarEstado(userId, button.dataset.status);
        }

        if (action === 'delete') {
            eliminarUsuario(userId);
        }

    });

    document.getElementById('usersTable').addEventListener('change', (event) => {

        const select = event.target.closest('select[data-action="role"]');

        if (!select) return;

        cambiarRol(
            select.dataset.userId,
            select.value,
            select.dataset.previousRole
        );

    });

    document.getElementById('postsTable').addEventListener('click', (event) => {

        const button = event.target.closest('button[data-action="delete"]');

        if (!button) return;

        eliminarPost(button.dataset.postId);

    });

});


// ─────────────────────────────────────────────
// ESTADÍSTICAS
// ─────────────────────────────────────────────

async function cargarStats() {

    try {

        const response = await fetch(
            '/api/admin/stats',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            Modal.fire({
                icon: 'error',
                title: 'Error al cargar',
                text: data.message || 'No se pudieron cargar las estadísticas.',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        document.getElementById('statUsuarios').textContent =
            data.usuarios.total;

        document.getElementById('statActivos').textContent =
            data.usuarios.activos;

        document.getElementById('statSuspendidos').textContent =
            data.usuarios.suspendidos;

        document.getElementById('statPosts').textContent =
            data.publicaciones.total;

    } catch (error) {

        console.error('Error al cargar estadísticas:', error);

        errorServidor();

    }

}


// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────

async function cargarUsuarios() {

    try {

        const response = await fetch(
            '/api/admin/users',
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
                title: 'No se pudieron cargar los usuarios',
                text: users.message || 'Error al consultar usuarios.',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        const table = document.getElementById('usersTable');

        table.innerHTML = '';

        if (!users.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        No hay usuarios registrados.
                    </td>
                </tr>
            `;

            return;
        }

        users.forEach(u => {

            const row = document.createElement('tr');

            const nuevoEstado = u.status === 'activo'
                ? 'suspendido'
                : 'activo';

            const accionEstado = u.status === 'activo'
                ? 'Suspender'
                : 'Activar';

            const claseEstado = u.status === 'activo'
                ? 'status-active'
                : 'status-suspended';

            const roles = [
                'usuario',
                'moderador',
                'administrador'
            ];

            const opcionesRol = roles.map(r => `
                <option value="${r}" ${u.role === r ? 'selected' : ''}>
                    ${r}
                </option>
            `).join('');

            row.innerHTML = `

                <td>
                    ${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}
                </td>

                <td>
                    ${escapeHtml(u.email)}
                </td>

                <td>
                    <select
                        class="form-select form-select-sm"
                        data-action="role"
                        data-user-id="${escapeHtml(u._id)}"
                        data-previous-role="${escapeHtml(u.role)}">

                        ${opcionesRol}

                    </select>
                </td>

                <td>
                    <span class="status-badge ${claseEstado}">
                        ${escapeHtml(u.status)}
                    </span>
                </td>

                <td>

                    <button
                        class="btn btn-sm ${u.status === 'activo' ? 'btn-danger' : 'btn-success'}"
                        data-action="status"
                        data-user-id="${escapeHtml(u._id)}"
                        data-status="${nuevoEstado}">

                        ${accionEstado}

                    </button>

                    <button
                        class="btn btn-sm btn-outline-danger ms-1"
                        data-action="delete"
                        data-user-id="${escapeHtml(u._id)}">

                        <i class="fa-solid fa-trash me-1"></i>
                        Eliminar

                    </button>

                </td>

            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error('Error al cargar usuarios:', error);

        errorServidor();

    }

}


// ─────────────────────────────────────────────
// PUBLICACIONES
// ─────────────────────────────────────────────

async function cargarPosts() {

    try {

        const response = await fetch(
            '/api/posts',
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const posts = await response.json();

        if (!response.ok) {

            Modal.fire({
                icon: 'error',
                title: 'No se pudieron cargar las publicaciones',
                text: posts.message || 'Error al consultar publicaciones.',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        const table = document.getElementById('postsTable');

        table.innerHTML = '';

        if (!posts.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">
                        No hay publicaciones registradas.
                    </td>
                </tr>
            `;

            return;
        }

        posts.forEach(p => {

            const autor = p.author
                ? `${p.author.firstName || ''} ${p.author.lastName || ''}`.trim()
                : 'Usuario';

            const contenido = String(p.content ?? '');

            const contenidoCorto = contenido.length > 80
                ? contenido.substring(0, 80) + '...'
                : contenido;

            const fecha = new Date(p.createdAt).toLocaleDateString('es-MX');

            const row = document.createElement('tr');

            row.innerHTML = `

                <td>
                    ${escapeHtml(autor)}
                </td>

                <td>
                    ${escapeHtml(contenidoCorto)}
                </td>

                <td>
                    ${escapeHtml(fecha)}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        data-action="delete"
                        data-post-id="${escapeHtml(p._id)}">

                        <i class="fa-solid fa-trash me-1"></i>
                        Eliminar

                    </button>

                </td>

            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error('Error al cargar publicaciones:', error);

        errorServidor();

    }

}


// ─────────────────────────────────────────────
// CAMBIAR ROL
// ─────────────────────────────────────────────

async function cambiarRol(userId, role, previousRole) {

    if (role === previousRole) return;

    const confirmacion = await Modal.fire({

        icon: 'question',

        title: '¿Cambiar rol?',

        text: `El usuario pasará a tener el rol de ${role}.`,

        showCancelButton: true,

        confirmButtonText: 'Sí, cambiar',

        cancelButtonText: 'Cancelar',

        reverseButtons: true

    });

    if (!confirmacion.isConfirmed) {

        cargarUsuarios();

        return;
    }

    try {

        const response = await fetch(
            `/api/admin/users/${encodeURIComponent(userId)}/role`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    role: role
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            Modal.fire({
                icon: 'error',
                title: 'No se pudo cambiar el rol',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });

            cargarUsuarios();

            return;
        }

        Toast.fire({
            icon: 'success',
            title: data.message || 'Rol actualizado correctamente'
        });

        cargarUsuarios();

    } catch (error) {

        console.error('Error al cambiar rol:', error);

        errorServidor();

        cargarUsuarios();

    }

}


// ─────────────────────────────────────────────
// CAMBIAR ESTADO
// ─────────────────────────────────────────────

async function cambiarEstado(userId, status) {

    const suspender = status === 'suspendido';

    const confirmacion = await Modal.fire({

        icon: 'warning',

        title: suspender
            ? '¿Suspender usuario?'
            : '¿Activar usuario?',

        text: suspender
            ? 'Este usuario ya no podrá utilizar las funciones de su cuenta.'
            : 'El usuario podrá volver a utilizar su cuenta.',

        showCancelButton: true,

        confirmButtonText: suspender
            ? 'Sí, suspender'
            : 'Sí, activar',

        cancelButtonText: 'Cancelar',

        reverseButtons: true

    });

    if (!confirmacion.isConfirmed) return;

    try {

        const response = await fetch(
            `/api/admin/users/${encodeURIComponent(userId)}/status`,
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
        cargarStats();

    } catch (error) {

        console.error('Error al cambiar estado:', error);

        errorServidor();

    }

}


// ─────────────────────────────────────────────
// ELIMINAR USUARIO
// ─────────────────────────────────────────────

async function eliminarUsuario(userId) {

    const confirmacion = await Modal.fire({

        icon: 'warning',

        title: '¿Eliminar usuario?',

        text: 'Esta acción es permanente y no se puede deshacer.',

        showCancelButton: true,

        confirmButtonText: 'Sí, eliminar',

        cancelButtonText: 'Cancelar',

        reverseButtons: true

    });

    if (!confirmacion.isConfirmed) return;

    try {

        const response = await fetch(
            `/api/admin/users/${encodeURIComponent(userId)}`,
            {
                method: 'DELETE',

                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            Modal.fire({
                icon: 'error',
                title: 'No se pudo eliminar',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        Toast.fire({
            icon: 'success',
            title: data.message || 'Usuario eliminado correctamente'
        });

        cargarUsuarios();
        cargarStats();

    } catch (error) {

        console.error('Error al eliminar usuario:', error);

        errorServidor();

    }

}


// ─────────────────────────────────────────────
// ELIMINAR PUBLICACIÓN
// ─────────────────────────────────────────────

async function eliminarPost(postId) {

    const confirmacion = await Modal.fire({

        icon: 'warning',

        title: '¿Eliminar publicación?',

        text: 'La publicación se eliminará permanentemente.',

        showCancelButton: true,

        confirmButtonText: 'Sí, eliminar',

        cancelButtonText: 'Cancelar',

        reverseButtons: true

    });

    if (!confirmacion.isConfirmed) return;

    try {

        const response = await fetch(
            `/api/admin/posts/${encodeURIComponent(postId)}`,
            {
                method: 'DELETE',

                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            Modal.fire({
                icon: 'error',
                title: 'No se pudo eliminar',
                text: data.message || 'Inténtalo de nuevo.',
                confirmButtonText: 'Entendido'
            });

            return;
        }

        Toast.fire({
            icon: 'success',
            title: data.message || 'Publicación eliminada correctamente'
        });

        cargarPosts();
        cargarStats();

    } catch (error) {

        console.error('Error al eliminar publicación:', error);

        errorServidor();

    }

}
