const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
}

const API = 'http://localhost:5000/api';

//Cargar perfil
async function cargarPerfil() {
    try {
        const res = await fetch(`${API}/usuarios/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
            document.getElementById('mensajeEdicion').textContent = data.message;
            return;
        }

        // Avatar
        const avatarContainer = document.getElementById('avatarContainer');
        if (data.avatar) {
            avatarContainer.innerHTML = `<img src="${data.avatar}" alt="avatar">`;
        } else {
            avatarContainer.textContent = (data.nombre[0] + data.apellido[0]).toUpperCase();
        }

        // Datos
        document.getElementById('nombreCompleto').textContent = `${data.nombre} ${data.apellido}`;
        document.getElementById('correoUsuario').textContent = data.correo;
        document.getElementById('biografiaUsuario').textContent = data.biografia || 'Sin biografía';

        // Prellenar formulario de edición
        document.getElementById('editNombre').value = data.nombre;
        document.getElementById('editApellido').value = data.apellido;
        document.getElementById('editBiografia').value = data.biografia || '';
        document.getElementById('editAvatar').value = data.avatar || '';

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

document.getElementById('btnEditar').addEventListener('click', () => {
    document.getElementById('vistaPerfil').style.display = 'none';
    document.getElementById('vistaEdicion').classList.add('activa');
});

//Cancelar edicion
document.getElementById('btnCancelar').addEventListener('click', () => {
    document.getElementById('vistaEdicion').classList.remove('activa');
    document.getElementById('vistaPerfil').style.display = 'block';
    document.getElementById('mensajeEdicion').textContent = '';
});

//Guardar cambios
document.getElementById('formEditar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensajeEdicion = document.getElementById('mensajeEdicion');

    const body = {
        nombre: document.getElementById('editNombre').value,
        apellido: document.getElementById('editApellido').value,
        biografia: document.getElementById('editBiografia').value,
        avatar: document.getElementById('editAvatar').value
    };

    const password = document.getElementById('editPassword').value;
    if (password) body.password = password;

    try {
        const res = await fetch(`${API}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            mensajeEdicion.style.color = '#4ade80';
            mensajeEdicion.textContent = 'Perfil actualizado correctamente';

            // Actualizar el localStorage con los nuevos datos
            localStorage.setItem('user', JSON.stringify({
                ...user,
                nombre: data.user.nombre,
                apellido: data.user.apellido
            }));

            // Volver a la vista de perfil
            setTimeout(() => {
                document.getElementById('vistaEdicion').classList.remove('activa');
                document.getElementById('vistaPerfil').style.display = 'block';
                mensajeEdicion.textContent = '';
                cargarPerfil();
            }, 1000);

        } else {
            mensajeEdicion.style.color = '#f87171';
            mensajeEdicion.textContent = data.message;
        }

    } catch (error) {
        console.error(error);
        mensajeEdicion.style.color = '#f87171';
        mensajeEdicion.textContent = 'Error al guardar cambios';
    }
});

//Eliminar cuenta
document.getElementById('btnEliminar').addEventListener('click', async () => {
    const confirmar = confirm('¿Estás seguro? Esta acción es irreversible.');
    if (!confirmar) return;

    try {
        const res = await fetch(`${API}/usuarios/perfil`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Cuenta eliminada');
            window.location.href = 'login.html';
        } else {
            alert('Error al eliminar cuenta');
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar cuenta');
    }
});

//Logout
document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Mostrar link de moderación solo a moderadores/admin
if (user.rol === 'moderador' || user.rol === 'administrador') {
    document.getElementById('linkModeracion').style.display = 'inline';
}

//Inicializar
cargarPerfil();