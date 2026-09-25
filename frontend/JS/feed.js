// 1. Validar sesión
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// 2. Cargar publicaciones al entrar
window.addEventListener('DOMContentLoaded', async () => {
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

        container.innerHTML += `
          <div class="post-card mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-white">${autor}</span>
              <span class="role-badge">${rol}</span>
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
      window.location.reload(); // Recargar la página para ver la nueva publicación
    } else {
      alert(data.message || 'Error al publicar');
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

// 4. Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = 'login.html';
});