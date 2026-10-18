import { storageMode } from "./firebase-config.js";
import { saveRegistration } from "./firebase.js";

const form = document.querySelector("#interestForm");
const button = form.querySelector("button[type='submit']");
const status = document.querySelector("#formStatus");
form.noValidate = true;

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

  const data = {
    nombre: form.elements.nombre.value,
    correo: form.elements.correo.value,
    telefono: form.elements.telefono.value,
    edad: Number(form.elements.edad.value),
    programa: form.elements.programa.value,
    horario: form.elements.horario.value,
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
    if (storageMode === "firebase") {
      const record = await saveRegistration(data);
      showStatus(
        "success",
        "¡Solicitud recibida! Tu código de registro es " + record.id + ".",
      );
    } else if (storageMode === "php") {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("El servidor PHP no está disponible.");
      }
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message);
      showStatus("success", result.message);
    } else {
      throw new Error("El modo de almacenamiento no es válido.");
    }
    form.reset();
    form.classList.remove("was-validated");
  } catch (error) {
    let message =
      "No se pudo confirmar el envío. Revisa tu conexión o inténtalo más tarde. Tus datos siguen en el formulario.";
    if (!error.code && error.message) message = error.message;
    if (error.code === "permission-denied")
      message =
        "Firebase rechazó el envío. El administrador debe revisar las reglas de Firestore.";
    if (error.code === "auth/operation-not-allowed")
      message =
        "El administrador debe habilitar el acceso anónimo en Firebase Authentication.";
    showStatus("error", message);
  } finally {
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
