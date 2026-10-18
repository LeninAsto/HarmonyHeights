(() => {
  "use strict";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  let preference;
  try { preference = localStorage.getItem("harmonyTheme"); } catch { /* Use system preference. */ }
  function apply(value) {
    const dark = value === "dark";
    root.dataset.theme = value;
    root.dataset.bsTheme = value;
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      button.setAttribute("aria-pressed", String(dark));
      button.textContent = dark ? "☀ Tema claro" : "☾ Tema oscuro";
    });
  }
  apply(preference === "dark" || preference === "light" ? preference : media.matches ? "dark" : "light");
  document.addEventListener("DOMContentLoaded", () => {
    apply(root.dataset.theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(button => button.addEventListener("click", () => {
      preference = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("harmonyTheme", preference); } catch { /* Current page still works. */ }
      apply(preference);
    }));
  });
  media.addEventListener("change", event => { if (!preference) apply(event.matches ? "dark" : "light"); });
  window.addEventListener("storage", event => {
    if (event.key === "harmonyTheme") { preference = event.newValue; apply(preference || (media.matches ? "dark" : "light")); }
  });
})();
