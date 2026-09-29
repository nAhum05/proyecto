document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault(); 

  // Capturar los valores de los inputs
  const nombre = document.getElementById('firstName').value;
  const apellido = document.getElementById('lastName').value;
  const fechaNacimiento = document.getElementById('birthDate').value;
  const correo = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  try {
    const response = await fetch('http://localhost:5000/api/register', { //temporal por que esta
        //en local
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        apellido,
        fechaNacimiento,
        correo,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.textContent = '¡Registro exitoso! Redirigiendo al login...';
      window.location.href = 'login.html';
    } else {
      mensaje.textContent = data.message || 'Error al registrar usuario';
    }

  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor.';
  }
});