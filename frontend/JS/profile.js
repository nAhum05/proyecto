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
            alert(data.message || 'Error al obtener el perfil');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
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
            alert('Perfil actualizado correctamente');

            // Actualizar los datos guardados en LocalStorage
            userStored.firstName = firstName;
            userStored.lastName = lastName;
            localStorage.setItem('user', JSON.stringify(userStored));

            window.location.reload(); // Recargar la página para reflejar los cambios
        } else {
            alert(data.message || 'Error al actualizar');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
});

// 4. Eliminar cuenta
document.getElementById('btnDeleteAccount').addEventListener('click', async () => {
    if (!confirm('¿Seguro que deseas eliminar tu cuenta?')) return;

    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cuenta eliminada');
            localStorage.clear();
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Error al eliminar cuenta');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
});

// 5. Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'login.html';
});