document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 

  // Capturar los valores de los inputs
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const birthDate = document.getElementById('birthDate').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', { //temporal por que esta
        //en local
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        birthDate,
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('¡Registro exitoso! Redirigiendo al login...');
      window.location.href = 'login.html'; // Redirige a login
    } else {
      alert(data.message || 'Error al registrar usuario');
    }

  } catch (error) {
    console.error('Error de red:', error);
    alert('No se pudo conectar con el servidor.');
  }
});