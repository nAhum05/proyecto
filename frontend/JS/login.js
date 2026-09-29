document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const mensaje = document.getElementById('mensaje');

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar Token y el Objeto User completo
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      mensaje.textContent = `¡Bienvenido, ${data.user.nombre}!`;
      window.location.href = 'inicio.html';

      // Redirigir al feed
      window.location.href = 'inicio.html';
    } else {
      mensaje.textContent = data.message || 'Error al iniciar sesión';
    }

  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor.';
  }
});