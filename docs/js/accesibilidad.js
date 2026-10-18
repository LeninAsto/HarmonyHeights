"use strict";

const panel = document.querySelector("#accessibilityPanel");
const accessibilityButton = document.querySelector("#accessibilityButton");
const closeButton = panel.querySelector(".panel-close");
let settings = loadAccessibilitySettings();
applyAccessibilitySettings(settings, panel);

function setPanel(open) {
  panel.hidden = !open;
  accessibilityButton.setAttribute("aria-expanded", String(open));
  if (open) closeButton.focus();
  else accessibilityButton.focus();
}

accessibilityButton.addEventListener("click", () => setPanel(panel.hidden));
closeButton.addEventListener("click", () => setPanel(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) setPanel(false);
});

for (const button of panel.querySelectorAll("[data-font-action]")) {
  button.addEventListener("click", () => {
    let change = 10;
    if (button.dataset.fontAction === "decrease") change = -10;
    settings.fontScale = Math.max(
      90,
      Math.min(130, settings.fontScale + change),
    );
    saveAndApplySettings(settings, panel);
  });
}

for (const button of panel.querySelectorAll("[data-a11y-toggle]")) {
  button.addEventListener("click", () => {
    const key = button.dataset.a11yToggle;
    settings[key] = !settings[key];
    saveAndApplySettings(settings, panel);
  });
}

panel.querySelector(".reset-accessibility").addEventListener("click", () => {
  settings = defaultAccessibilitySettings();
  saveAndApplySettings(settings, panel);
});

const topButton = document.querySelector("#backToTop");
window.addEventListener("scroll", updateTopButton, { passive: true });
updateTopButton();
function updateTopButton() {
  topButton.classList.toggle("show", window.scrollY > 500);
}
topButton.addEventListener("click", () => {
  let behavior = "smooth";
  if (
    settings.motion ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    behavior = "instant";
  window.scrollTo({ top: 0, behavior: behavior });
  document.querySelector(".skip-link").focus({ preventScroll: true });
});

const audio = document.querySelector("#ambientAudio");
const ambientButton = document.querySelector("#ambientButton");
audio.volume = 0.3;
ambientButton.addEventListener("click", async () => {
  if (!audio.paused) {
    audio.pause();
    updateAudioButton(false);
    return;
  }
  try {
    await audio.play();
    updateAudioButton(true);
  } catch (error) {
    updateAudioButton(false);
    ambientButton.querySelector(".visually-hidden").textContent =
      "No se pudo reproducir el audio. Intentar otra vez";
  }
});
audio.addEventListener("error", () => updateAudioButton(false));
function updateAudioButton(playing) {
  ambientButton.setAttribute("aria-pressed", String(playing));
  let label = "Activar música ambiental";
  if (playing) label = "Detener música ambiental";
  ambientButton.querySelector(".visually-hidden").textContent = label;
}

function defaultAccessibilitySettings() {
  return {
    fontScale: 100,
    contrast: false,
    grayscale: false,
    readable: false,
    links: false,
    motion: false,
  };
}

function loadAccessibilitySettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("harmonyAccessibility") || "{}",
    );
    const preferences = defaultAccessibilitySettings();
    if (Number.isFinite(saved.fontScale))
      preferences.fontScale = Math.max(90, Math.min(130, saved.fontScale));
    for (const key of [
      "contrast",
      "grayscale",
      "readable",
      "links",
      "motion",
    ]) {
      preferences[key] = saved[key] === true;
    }
    return preferences;
  } catch (_error) {
    return defaultAccessibilitySettings();
  }
}

function saveAndApplySettings(settings, panel) {
  try {
    localStorage.setItem("harmonyAccessibility", JSON.stringify(settings));
  } catch (_error) {
    panel.dataset.storage = "unavailable";
  }
  applyAccessibilitySettings(settings, panel);
}

function applyAccessibilitySettings(settings, panel) {
  const root = document.documentElement;
  root.style.fontSize = `${settings.fontScale}%`;
  root.classList.toggle("a11y-contrast", settings.contrast);
  root.classList.toggle("a11y-grayscale", settings.grayscale);
  root.classList.toggle("a11y-readable", settings.readable);
  root.classList.toggle("a11y-links", settings.links);
  root.classList.toggle("a11y-motion", settings.motion);
  panel.querySelector("#fontScale").textContent = `${settings.fontScale}%`;
  panel.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
    const active = Boolean(settings[button.dataset.a11yToggle]);
    button.setAttribute("aria-pressed", active.toString());
    button.classList.toggle("active", active);
  });
}
