import { connectFirebase, signInWithGoogle, saveRegistration } from "./firebase.js";

import { schedules } from "./horarios.js";
import { getTurnstileToken, resetTurnstile } from "./turnstile.js";

const form = document.querySelector("#interestForm");
const button = form.querySelector("button[type='submit']");
const status = document.querySelector("#formStatus");
form.noValidate = true;
button.disabled = false;

const day = form.elements.dia;
const time = form.elements.horario;
function updateTimes() {
  time.replaceChildren(new Option(day.value ? "Selecciona una franja" : "Primero selecciona un día", ""));
  for (const slot of schedules[day.value] || []) time.add(new Option(slot.replace("-", " – "), slot));
  time.disabled = !day.value;
}
day.addEventListener("change", updateTimes);
form.addEventListener("reset", () => setTimeout(updateTimes, 0));
updateTimes();
const login = document.querySelector("#googleLogin");
const logout = document.querySelector("#googleLogout");
const account = document.querySelector("#googleAccount");
let watchingAccount = false;
function watchAccount(firebase) {
  if (watchingAccount) return;
  watchingAccount = true;
  firebase.authSdk.onAuthStateChanged(firebase.auth, user => {
    const google = user?.providerData.some(provider => provider.providerId === "google.com");
    login.hidden = Boolean(google);
    logout.hidden = !google;
    account.textContent = google ? `Conectado: ${user.email}` : "Aún no has iniciado sesión.";
    if (google && !form.elements.correo.value) form.elements.correo.value = user.email || "";
  });
}
connectFirebase().then(watchAccount).catch(() => { account.textContent = "No se pudo conectar con Google. Comprueba tu conexión y vuelve a intentar."; });
login.addEventListener("click", async () => {
  login.disabled = true;
  try { await signInWithGoogle(); watchAccount(await connectFirebase()); }
  catch { account.textContent = "No se pudo iniciar sesión. Permite la ventana de Google y vuelve a intentar."; }
  finally { login.disabled = false; }
});
logout.addEventListener("click", async () => {
  logout.disabled = true;
  try { const firebase = await connectFirebase(); await firebase.authSdk.signOut(firebase.auth); }
  catch { account.textContent = "No se pudo cerrar sesión. Vuelve a intentar."; }
  finally { logout.disabled = false; }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return;
  for (const name of ["nombre", "correo", "telefono", "mensaje"]) {
    form.elements[name].value = form.elements[name].value.trim();
  }
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    showStatus("error", "Revisa los campos marcados antes de enviar.");
    form.querySelector(":invalid").focus();
    return;
  }
  if (form.elements.website.value) {
    showStatus(
      "error",
      "No se pudo enviar la solicitud. Recarga la página e inténtalo otra vez.",
    );
    return;
  }

  if (!schedules[day.value]?.includes(time.value)) {
    showStatus("error", "Selecciona un horario válido para el día elegido.");
    day.focus();
    return;
  }
  const data = {
    nombre: form.elements.nombre.value,
    correo: form.elements.correo.value,
    telefono: form.elements.telefono.value,
    edad: Number(form.elements.edad.value),
    programa: form.elements.programa.value,
    dia: day.value,
    horario: time.value,
    mensaje: form.elements.mensaje.value,
    consentimiento: "acepto",
  };

  button.disabled = true;
  button.textContent = "Enviando…";
  form.setAttribute("aria-busy", "true");
  showStatus(
    "pending",
    "Estamos enviando tu solicitud. Espera la confirmación antes de cerrar esta página.",
  );

  try {
    const record = await saveRegistration(data, getTurnstileToken());
    showStatus(
      "success",
      "¡Solicitud recibida! Tu código de registro es " + record.id + ".",
    );
    form.reset();
    form.classList.remove("was-validated");
  } catch (error) {
    let message =
      "No se pudo confirmar el envío. Revisa tu conexión o inténtalo más tarde. Tus datos siguen en el formulario.";
    if (["app/auth-required", "app/captcha-required", "functions/unauthenticated", "functions/permission-denied", "functions/invalid-argument", "functions/failed-precondition", "functions/unavailable"].includes(error.code)) message = error.message;
    if (error.code === "permission-denied")
      message =
        "Firebase rechazó el envío. El administrador debe revisar las reglas de Firestore.";
    if (error.code === "auth/operation-not-allowed")
      message =
        "El administrador debe habilitar el acceso con Google en Firebase Authentication.";
    showStatus("error", message);
  } finally {
    resetTurnstile();
    button.disabled = false;
    button.textContent = "Enviar solicitud";
    form.removeAttribute("aria-busy");
  }
});

function showStatus(type, message) {
  status.className = "form-status show " + type;
  status.textContent = message;
  if (type !== "pending") status.focus();
}
