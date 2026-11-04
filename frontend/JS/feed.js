// Ventana central con la paleta NIX (SweetAlert2)
const Modal = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: 'swal-nix',
    confirmButton: 'swal-nix-confirm',
    cancelButton: 'swal-nix-cancel'
  }
});

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

// 1. Validar sesión y obtener datos del usuario
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user')); // <--- Leemos el usuario guardado

if (!token) {
  window.location.href = 'login.html';
}

// 2. Cargar publicaciones al entrar
window.addEventListener('DOMContentLoaded', async () => {

  // Si el usuario está baneado, restringir visualmente la sección de escritura
  if (user && user.status === 'baneado') {
    const postContent = document.getElementById('postContent');
    const btnPublish = document.getElementById('btnPublish');
    
    if (postContent && btnPublish) {
      postContent.placeholder = 'Tu cuenta está baneada. Puedes ver el contenido, pero tienes prohibido publicar.';
      postContent.disabled = true;
      btnPublish.disabled = true;
      btnPublish.classList.add('disabled');
    }
  }

  // Si venimos de publicar, mostrar el aviso
  if (sessionStorage.getItem('postPublished')) {
    sessionStorage.removeItem('postPublished');
    Toast.fire({ icon: 'success', title: 'Publicación realizada' });
  }

  try {
    const response = await fetch('http://localhost:5000/api/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      const container = document.getElementById('postsContainer');
      container.innerHTML = ''; // Limpiar mensaje de carga

      if (data.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center py-3">No hay publicaciones aún.</p>';
        return;
      }

      // Dibujar cada publicación con un for simple
      for (let i = 0; i < data.length; i++) {
        const post = data[i];
        const autor = post.author ? `${post.author.firstName} ${post.author.lastName || ''}` : 'Usuario';
        const rol = post.author ? post.author.role : 'usuario';

        const fechaCreacion = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Hace un momento';

        container.innerHTML += `
          <div class="post-card mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="fw-bold text-white">${autor}</span>
              <span class="role-badge">${rol}</span>
            </div>
            <div class="mb-2">
              <span style="font-size: 0.75rem; color: var(--gold-light); opacity: 0.85;">
                <i class="fa-regular fa-clock me-1"></i>${fechaCreacion}
              </span>
            </div>
            <p class="post-content mb-0">${post.content}</p>
          </div>
        `;
      }
    } else {
      alert(data.message || 'Error al cargar publicaciones');
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

// 3. Crear publicación
document.getElementById('btnPublish').addEventListener('click', async (e) => {
  e.preventDefault();

  const content = document.getElementById('postContent').value;

  if (!content.trim()) {
    alert('Escribe algo antes de publicar');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById('postContent').value = '';
      sessionStorage.setItem('postPublished', '1'); // para mostrar el aviso tras recargar
      window.location.reload(); // Recargar la página para ver la nueva publicación
    } else {
      alert(data.message || 'Error al publicar');
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

// 4. Cerrar sesión (con confirmación)
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