document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(`¡Bienvenido de nuevo, ${data.user.firstName}!`);
      
      
    } else {
      alert(data.message || 'Error al iniciar sesión');
    }

  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor.');
  }
});