const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token) {
    window.location.href = 'login.html';
}

const API = 'http://localhost:5000/api';  
const mensaje = document.getElementById('mensaje');

let comunidadActual = null;

function mostrarMensaje(texto) {
    mensaje.textContent = texto;
}

// Cambio de vistas
function mostrarVistaComunidades() {
    document.getElementById('vistaComunidades').classList.add('activa');
    document.getElementById('vistaComunidad').classList.remove('activa');
    cargarComunidades();
}

function mostrarVistaComunidad(comunidad) {
    comunidadActual = comunidad;
    document.getElementById('vistaComunidades').classList.remove('activa');
    document.getElementById('vistaComunidad').classList.add('activa');

    document.getElementById('tituloComunidad').textContent = comunidad.nombre;
    document.getElementById('descripcionComunidad').textContent = comunidad.descripcion || '';

    // Mostrar miembros
    const listaMiembros = document.getElementById('listaMiembros');
    const contador = document.getElementById('contadorMiembros');

    fetch(`${API}/comunidades/${comunidad._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
        contador.textContent = data.miembros.length;
        listaMiembros.innerHTML = data.miembros.map(m =>
            `<span class="badge bg-secondary bg-opacity-25 text-light">${m.nombre} ${m.apellido}</span>`
        ).join('');
    });

    cargarPosts(comunidad._id);
}

document.getElementById('btnVolver').addEventListener('click', mostrarVistaComunidades);
document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Cargar comunidades
async function cargarComunidades() {
    try {
        const res = await fetch(`${API}/comunidades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const comunidades = await res.json();

        const lista = document.getElementById('listaComunidades');
        lista.innerHTML = '';

        if (comunidades.length === 0) {
            lista.innerHTML = '<p class="text-secondary">No hay comunidades aún. ¡Crea la primera!</p>';
            return;
        }

        comunidades.forEach(c => {
            const esMiembro = c.miembros.some(m => m._id === user.id);

            const avatars = c.miembros.slice(0, 5).map(m =>
                `<span class="avatar-circle" title="${m.nombre} ${m.apellido}">${m.nombre[0]}${m.apellido[0]}</span>`
            ).join('');

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="community-card">
                    <div>
                        <div class="community-icon">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <h4>${c.nombre}</h4>
                        <p>${c.descripcion || 'Sin descripción'}</p>

                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar-stack">${avatars}</div>
                            <small class="text-secondary ms-2">${c.miembros.length} miembros</small>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <button class="btn-gradient w-100" onclick='entrarComunidad(${JSON.stringify(c)})'>
                            <i class="fa-solid fa-right-to-bracket me-1"></i> Entrar
                        </button>
                        <button class="btn-ghost" onclick="toggleMiembro('${c._id}')">
                            ${esMiembro ? 'Salir' : 'Unirse'}
                        </button>
                    </div>
                </div>
            `;
            lista.appendChild(col);
        });

    } catch (error) {
        mostrarMensaje('Error al cargar comunidades');
    }
}

// Entrar a una comunidad
function entrarComunidad(comunidad) {
    mostrarVistaComunidad(comunidad);
}

// Crear comunidad
document.getElementById('formComunidad').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombreComunidad').value;
    const descripcion = document.getElementById('descripcionComunidadInput').value;

    const res = await fetch(`${API}/comunidades`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, descripcion })
    });

    const data = await res.json();
    if (res.ok) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearComunidad'));
        modal.hide();
        document.getElementById('formComunidad').reset();
        cargarComunidades();
    } else {
        mostrarMensaje(data.message);
    }
});

// Cargar publicaciones de una comunidad
async function cargarPosts(comunidadId) {
    const res = await fetch(`${API}/posts/comunidad/${comunidadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const posts = await res.json();

    const lista = document.getElementById('listaPosts');
    lista.innerHTML = '';

    if (posts.length === 0) {
        lista.innerHTML = '<p class="text-secondary">No hay publicaciones aún. ¡Sé el primero!</p>';
        return;
    }

    posts.forEach(p => {
        const div = document.createElement('div');
        div.className = 'post-card';
        div.innerHTML = `
            <h5>${p.titulo}</h5>
            <p>${p.contenido}</p>
            <small>Por ${p.autor.nombre} ${p.autor.apellido}</small>
            <div class="mt-2">
                <button class="btn-ghost" onclick="darLike('${p._id}')">❤️ ${p.likes.length}</button>
                <button class="btn-ghost" onclick="verComentarios('${p._id}')">💬 Comentarios</button>
                <button class="btn-ghost" onclick="reportar('${p._id}')">🚩 Reportar</button>
            </div>
            <div id="comentarios-${p._id}" class="mt-2"></div>
        `;
        lista.appendChild(div);
    });
}

// Crear publicaciones
document.getElementById('formPost').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('tituloPost').value;
    const contenido = document.getElementById('contenidoPost').value;

    const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            titulo,
            contenido,
            comunidad: comunidadActual._id
        })
    });

    const data = await res.json();
    if (res.ok) {
        document.getElementById('formPost').reset();
        cargarPosts(comunidadActual._id);
    } else {
        mostrarMensaje(data.message);
    }
});

// Dar like
async function darLike(postId) {
    const res = await fetch(`${API}/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        cargarPosts(comunidadActual._id);
    }
}

//Comentarios
async function verComentarios(postId) {
    const res = await fetch(`${API}/posts/${postId}/comentarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const comentarios = await res.json();

    const div = document.getElementById(`comentarios-${postId}`);
    div.innerHTML = comentarios.map(c =>
        `<p class="text-secondary small mb-1"><strong class="text-white">${c.autor.nombre}:</strong> ${c.contenido}</p>`
    ).join('');

    div.innerHTML += `
        <div class="d-flex gap-2 mt-2">
            <input type="text" id="nuevoComentario-${postId}" class="form-control form-control-sm" placeholder="Escribe un comentario...">
            <button class="btn-gradient btn-sm" onclick="comentar('${postId}')">Enviar</button>
        </div>
    `;
}

async function comentar(postId) {
    const contenido = document.getElementById(`nuevoComentario-${postId}`).value;
    if (!contenido) return;

    const res = await fetch(`${API}/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido })
    });

    if (res.ok) {
        verComentarios(postId);
    }
}

//Unirse o salirse de una comunidad
async function toggleMiembro(comunidadId) {
    const res = await fetch(`${API}/comunidades/${comunidadId}/miembro`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
        cargarComunidades();
    } else {
        mostrarMensaje(data.message);
    }
}

function reportar(postId) {
    // Guardamos el ID del post en el input hidden
    document.getElementById('reportePostId').value = postId;

    // Limpiamos el campo y el mensaje
    document.getElementById('reporteMotivo').value = '';
    document.getElementById('mensajeReporte').textContent = '';

    // Abrimos el modal
    const modal = new bootstrap.Modal(document.getElementById('modalReportar'));
    modal.show();
}

// Enviar el formulario del modal
document.getElementById('formReportar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const postId = document.getElementById('reportePostId').value;
    const motivo = document.getElementById('reporteMotivo').value;
    const mensajeReporte = document.getElementById('mensajeReporte');

    try {
        const res = await fetch(`${API}/reportes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ publicacionId: postId, motivo })
        });

        const data = await res.json();

        if (res.ok) {
            mensajeReporte.style.color = '#4ade80';
            mensajeReporte.textContent = '¡Reporte enviado a moderación!';

            // Cerramos el modal después de 1.2 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalReportar'));
                modal.hide();
            }, 1200);
        } else {
            mensajeReporte.style.color = '#f87171';
            mensajeReporte.textContent = data.message || 'Error al reportar';
        }

    } catch (error) {
        console.error(error);
        mensajeReporte.style.color = '#f87171';
        mensajeReporte.textContent = 'Error de conexión con el servidor';
    }
});

// Mostrar link de moderación solo a moderadores/admin
if (user.rol === 'moderador' || user.rol === 'administrador') {
    document.getElementById('linkModeracion').style.display = 'inline';
}

//Inicializar
cargarComunidades();