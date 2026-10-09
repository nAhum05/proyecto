const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Verificar que haya sesión
if (!token || !user) {
    window.location.href = 'login.html';
}

// Verificar que sea administrador
if (user.role !== 'administrador') {
    window.location.href = 'feed.html';
}

// Cargar todo al abrir
document.addEventListener('DOMContentLoaded', () => {
    cargarStats();
    cargarUsuarios();
    cargarPosts();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});

// ─────────────────────────────────────────────
// ESTADÍSTICAS
// ─────────────────────────────────────────────
async function cargarStats() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/admin/stats',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Error al cargar estadísticas');
            return;
        }

        document.getElementById('statUsuarios').textContent    = data.usuarios.total;
        document.getElementById('statActivos').textContent     = data.usuarios.activos;
        document.getElementById('statSuspendidos').textContent = data.usuarios.suspendidos;
        document.getElementById('statPosts').textContent       = data.publicaciones.total;

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────
async function cargarUsuarios() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/admin/users',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const users = await response.json();

        if (!response.ok) {
            alert(users.message || 'Error al consultar usuarios');
            return;
        }

        const table = document.getElementById('usersTable');
        table.innerHTML = '';

        users.forEach(u => {
            const row = document.createElement('tr');

            const nuevoEstado = u.status === 'activo' ? 'suspendido' : 'activo';
            const accionEstado = u.status === 'activo' ? 'Suspender' : 'Activar';

            // Opciones de rol
            const roles = ['usuario', 'moderador', 'administrador'];
            const opcionesRol = roles
                .map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r}</option>`)
                .join('');

            row.innerHTML = `
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.email}</td>
                <td>
                    <select class="form-select form-select-sm"
                            onchange="cambiarRol('${u._id}', this.value)">
                        ${opcionesRol}
                    </select>
                </td>
                <td>${u.status}</td>
                <td>
                    <button
                        class="btn btn-sm ${u.status === 'activo' ? 'btn-danger' : 'btn-success'}"
                        onclick="cambiarEstado('${u._id}', '${nuevoEstado}')">
                        ${accionEstado}
                    </button>
                    <button
                        class="btn btn-sm btn-outline-danger ms-1"
                        onclick="eliminarUsuario('${u._id}')">
                        Eliminar
                    </button>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

// ─────────────────────────────────────────────
// PUBLICACIONES
// ─────────────────────────────────────────────
async function cargarPosts() {
    try {
        const response = await fetch(
            'http://localhost:5000/api/posts',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        const posts = await response.json();

        if (!response.ok) {
            alert(posts.message || 'Error al consultar publicaciones');
            return;
        }

        const table = document.getElementById('postsTable');
        table.innerHTML = '';

        if (posts.length === 0) {
            table.innerHTML = '<tr><td colspan="4" class="text-center text-secondary">Sin publicaciones.</td></tr>';
            return;
        }

        posts.forEach(p => {
            const autor = p.author
                ? `${p.author.firstName} ${p.author.lastName || ''}`
                : 'Usuario';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${autor}</td>
                <td>${p.content.substring(0, 80)}${p.content.length > 80 ? '...' : ''}</td>
                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="eliminarPost('${p._id}')">
                        Eliminar
                    </button>
                </td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

// ─────────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────────
async function cambiarRol(userId, role) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/users/${userId}/role`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'No se pudo cambiar el rol');
            return;
        }

        alert(data.message);
        cargarUsuarios();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function cambiarEstado(userId, status) {
    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/users/${userId}/status`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'No se pudo cambiar el estado');
            return;
        }

        alert(data.message);
        cargarUsuarios();
        cargarStats();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function eliminarUsuario(userId) {
    if (!confirm('¿Eliminar este usuario permanentemente?')) return;

    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/users/${userId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'No se pudo eliminar el usuario');
            return;
        }

        alert(data.message);
        cargarUsuarios();
        cargarStats();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function eliminarPost(postId) {
    if (!confirm('¿Eliminar esta publicación?')) return;

    try {
        const response = await fetch(
            `http://localhost:5000/api/admin/posts/${postId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'No se pudo eliminar la publicación');
            return;
        }

        alert(data.message);
        cargarPosts();
        cargarStats();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo conectar con el servidor.');
    }
}