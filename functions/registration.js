"use strict";

class RegistrationError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const fields = ["nombre", "correo", "telefono", "edad", "programa", "dia", "horario", "mensaje", "consentimiento"];
const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const slots = ["09:00-10:30", "11:00-12:30", "15:00-16:30", "17:00-18:30"];
const invalid = () => new RegistrationError("invalid-argument", "Revisa los datos y el horario de tu solicitud.");

function validateRegistration(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || Object.keys(value).length !== fields.length
      || !fields.every(field => Object.hasOwn(value, field))) throw invalid();
  const data = { ...value };
  for (const field of fields.filter(field => field !== "edad")) {
    if (typeof data[field] !== "string") throw invalid();
    data[field] = data[field].trim();
  }
  if (data.nombre.length < 3 || data.nombre.length > 80
      || data.correo.length > 120 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.correo)
      || !/^[0-9+() -]{7,20}$/.test(data.telefono)
      || !Number.isInteger(data.edad) || data.edad < 5 || data.edad > 99
      || !["musica", "danza", "escena", "orientacion"].includes(data.programa)
      || !days.includes(data.dia) || !slots.includes(data.horario)
      || (data.dia === "sabado" && !slots.slice(0, 2).includes(data.horario))
      || data.mensaje.length > 500 || data.consentimiento !== "acepto") throw invalid();
  return data;
}

async function submitRegistration(request, { secret, hostnames, fetchImpl = fetch, writeRegistration }) {
  if (!request.auth) throw new RegistrationError("unauthenticated", "Inicia sesión con Google antes de enviar.");
  if (request.auth.token?.firebase?.sign_in_provider !== "google.com") {
    throw new RegistrationError("permission-denied", "Para enviar necesitas una sesión de Google.");
  }
  const { registration, turnstileToken } = request.data || {};
  const data = validateRegistration(registration);
  if (typeof turnstileToken !== "string" || !turnstileToken.trim() || turnstileToken.length > 2048) {
    throw new RegistrationError("failed-precondition", "Completa la verificación de Cloudflare antes de enviar.");
  }
  if (!secret || !hostnames.length) {
    throw new RegistrationError("unavailable", "La protección de envíos aún no está disponible.");
  }
  let verification;
  try {
    const response = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: turnstileToken }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Verification service unavailable");
    verification = await response.json();
  } catch {
    throw new RegistrationError("unavailable", "No se pudo verificar Cloudflare. Inténtalo otra vez.");
  }
  // Never trust the client widget alone. Tokens are short-lived and single-use.
  if (verification?.success !== true || verification.action !== "contacto"
      || !hostnames.includes(verification.hostname)) {
    throw new RegistrationError("failed-precondition", "La verificación venció o no es válida. Complétala otra vez.");
  }
  const id = await writeRegistration({ ...data, uid: request.auth.uid });
  return { id };
}

module.exports = { RegistrationError, validateRegistration, submitRegistration };
