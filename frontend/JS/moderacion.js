const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
}

// Solo moderadores y admins pueden entrar
if (user.rol !== 'moderador' && user.rol !== 'administrador') {
    alert('No tienes permisos para acceder aquí');
    window.location.href = 'feed.html';
}

const API = 'http://localhost:5000/api';
const mensaje = document.getElementById('mensaje');

//Cargar reportes pendientes
async function cargarReportes() {
    try {
        const res = await fetch(`${API}/moderacion/reportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportes = await res.json();

        const lista = document.getElementById('listaReportes');
        const contador = document.getElementById('contadorPendientes');

        contador.textContent = `${reportes.length} pendientes`;
        lista.innerHTML = '';

        if (reportes.length === 0) {
            lista.innerHTML = '<div class="glass-card text-center text-secondary">No hay reportes pendientes</div>';
            return;
        }

        reportes.forEach(r => {
            const post = r.publicacion;
            const div = document.createElement('div');
            div.className = 'report-card';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5>${post ? post.titulo : 'Publicación eliminada'}</h5>
                    <span class="badge-pendiente">Pendiente</span>
                </div>
                <p><strong>Motivo del reporte:</strong> ${r.motivo}</p>
                <p><strong>Reportado por:</strong> ${r.reportadoPor.nombre} ${r.reportadoPor.apellido} (${r.reportadoPor.correo})</p>
                ${post ? `<p><strong>Contenido:</strong> ${post.contenido}</p>` : ''}
                <div class="d-flex gap-2 mt-3">
                    <button class="btn-warning-soft" onclick="ocultarPost('${post?._id}', '${r._id}')">
                        Ocultar
                    </button>
                    <button class="btn-danger-soft" onclick="eliminarPost('${post?._id}', '${r._id}')">
                        Eliminar
                    </button>
                    <button class="btn-gradient" onclick="descartarReporte('${r._id}')">
                        Descartar
                    </button>
                </div>
            `;
            lista.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        mensaje.textContent = 'Error al cargar reportes';
    }
}

//Ocultar publicacion
async function ocultarPost(postId, reporteId) {
    if (!postId) return alert('La publicación ya no existe');
    await cambiarEstado(postId, 'oculto', reporteId);
}

//Eliminar publicacion
async function eliminarPost(postId, reporteId) {
    if (!postId) return alert('La publicación ya no existe');
    if (!confirm('¿Eliminar esta publicación definitivamente?')) return;
    await cambiarEstado(postId, 'eliminado', reporteId);
}

//Cambiar estado de la publicacion
async function cambiarEstado(postId, nuevoEstado, reporteId) {
    try {
        const res = await fetch(`${API}/moderacion/publicacion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ publicacionId: postId, nuevoEstado, reporteId })
        });

        const data = await res.json();
        if (res.ok) {
            cargarReportes();
        } else {
            mensaje.textContent = data.message;
        }
    } catch (error) {
        console.error(error);
        mensaje.textContent = 'Error al moderar';
    }
}

//Descartar reporte
async function descartarReporte(reporteId) {
    try {
        const res = await fetch(`${API}/moderacion/publicacion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                publicacionId: null, // no toca el post
                nuevoEstado: null,
                reporteId,
                descartar: true
            })
        });

        const data = await res.json();
        if (res.ok) {
            cargarReportes();
        } else {
            mensaje.textContent = data.message;
        }
    } catch (error) {
        console.error(error);
        mensaje.textContent = 'Error al descartar';
    }
}

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
cargarReportes();