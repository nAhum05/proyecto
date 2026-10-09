const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));


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

    document.getElementById('logoutBtn').addEventListener('click', () => {

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
            alert(users.message || 'Error al consultar usuarios');
            return;
        }

        const table = document.getElementById('usersTable');

        table.innerHTML = '';

        users.forEach(user => {

            const row = document.createElement('tr');

            const accion = user.status === 'activo'
                ? 'Suspender'
                : 'Activar';

            const nuevoEstado = user.status === 'activo'
                ? 'suspendido'
                : 'activo';

            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.status}</td>
                <td>
                    <button
                        class="btn btn-sm ${user.status === 'activo' ? 'btn-danger' : 'btn-success'}"
                        onclick="cambiarEstado('${user._id}', '${nuevoEstado}')">
                        ${accion}
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


// Cambiar estado del usuario
async function cambiarEstado(userId, status) {

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
            alert(data.message || 'No se pudo cambiar el estado');
            return;
        }

        alert(data.message);

        // Volver a cargar la tabla
        cargarUsuarios();

    } catch (error) {

        console.error('Error:', error);

        alert('No se pudo conectar con el servidor.');

    }
}