// JS/forget.js
// Misma base que tu login (http://localhost:5000/api/login).
// Cambia el final de la ruta cuando crees el endpoint en el backend.
const API_FORGOT_URL = 'http://localhost:5000/api/forgot-password';

const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('forgotEmail');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.getElementById('alertBox');
const alertText = document.getElementById('alertText');
const alertIcon = document.getElementById('alertIcon');

function showAlert(type, message) {
  alertBox.className = `alert ${type} show`;
  alertIcon.className = type === 'success'
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-triangle-exclamation';
  alertText.textContent = message;
}

function hideAlert() {
  alertBox.className = 'alert';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    showAlert('error', 'Escribe un correo electrónico válido.');
    emailInput.focus();
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Enviando...';

  try {
    const res = await fetch(API_FORGOT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    // Si el servidor falla (500) mostramos error; en cualquier otro caso
    // damos el mismo mensaje para no revelar si el correo existe o no.
    if (res.status >= 500) throw new Error('server');

    showAlert(
      'success',
      'Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.'
    );
    form.reset();
  } catch (err) {
    showAlert('error', 'No pudimos procesar tu solicitud. Inténtalo de nuevo en unos minutos.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});