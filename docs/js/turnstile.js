import { turnstileSiteKey } from "./firebase-config.js";

const container = document.querySelector("#turnstileWidget");
const status = document.querySelector("#captchaStatus");
const retry = document.querySelector("#captchaRetry");
let widgetId;
let token = "";
let scriptPromise;

function report(message, canRetry = false) {
  status.textContent = message;
  retry.hidden = !canRetry;
}

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error("Turnstile unavailable")); };
      document.head.append(script);
    }).catch(error => { scriptPromise = undefined; throw error; });
  }
  return scriptPromise;
}

async function renderWidget() {
  token = "";
  if (!turnstileSiteKey) {
    report("La verificación aún no está disponible. Inténtalo más tarde.");
    return;
  }
  report("Cargando verificación de Cloudflare…");
  try {
    await loadTurnstile();
    if (widgetId !== undefined) window.turnstile.remove(widgetId);
    report("Completa la verificación de Cloudflare antes de enviar.");
    widgetId = window.turnstile.render(container, {
      sitekey: turnstileSiteKey,
      action: "contacto",
      theme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      size: "compact",
      language: "es",
      "response-field": false,
      callback: response => { token = response; report("Verificación completada. Ya puedes enviar tu solicitud."); },
      "expired-callback": () => { token = ""; report("La verificación venció. Complétala otra vez.", true); },
      "timeout-callback": () => { token = ""; report("Se agotó el tiempo de verificación. Vuelve a intentar.", true); },
      "error-callback": () => { token = ""; report("No se pudo verificar. Revisa tu conexión y vuelve a intentar.", true); return true; },
    });
  } catch {
    report("No se pudo cargar Cloudflare. Revisa tu conexión y vuelve a intentar.", true);
  }
}

export function getTurnstileToken() { return token; }
export function resetTurnstile() {
  token = "";
  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.reset(widgetId);
    report("Completa una nueva verificación para volver a enviar.");
  }
}
retry.addEventListener("click", () => {
  if (widgetId !== undefined && window.turnstile) resetTurnstile();
  else renderWidget();
});
new MutationObserver(() => renderWidget()).observe(document.documentElement, {
  attributes: true, attributeFilter: ["data-theme"],
});
renderWidget();
