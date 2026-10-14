"use strict";

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    markActiveNavigation();
    selectProgramFromUrl();
    mountUtilityTools();
    enableRevealAnimations();
    enableProgramFilters();
    enableRegistrationForm();
});

function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });
}

function selectProgramFromUrl() {
    const programSelect = document.querySelector("#programa");
    if (!programSelect) return;

    const requestedProgram = new URLSearchParams(window.location.search).get("programa");
    const validOption = [...programSelect.options].some((option) => option.value === requestedProgram);
    if (validOption) programSelect.value = requestedProgram;
}

function markActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
        const isActive = link.getAttribute("href").split("#")[0] === currentPage;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
    });
}

function enableRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    });
    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("visible"));
        return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    window.setTimeout(() => {
        elements.forEach((element) => element.classList.add("visible"));
    }, 900);
}

function enableProgramFilters() {
    const buttons = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll("[data-category]");
    const resultText = document.querySelector("[data-filter-result]");
    if (!buttons.length || !cards.length) return;

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedCategory = button.dataset.filter;
            let visibleCount = 0;
            buttons.forEach((item) => {
                const selected = item === button;
                item.classList.toggle("active", selected);
                item.setAttribute("aria-pressed", selected.toString());
            });
            cards.forEach((card) => {
                const shouldShow = selectedCategory === "todos" || card.dataset.category === selectedCategory;
                card.hidden = !shouldShow;
                if (shouldShow) visibleCount += 1;
            });
            if (resultText) {
                resultText.textContent = `${visibleCount} programa${visibleCount === 1 ? "" : "s"} visible${visibleCount === 1 ? "" : "s"}`;
            }
        });
    });
}

function enableRegistrationForm() {
    const form = document.querySelector("#interestForm");
    if (!form) return;
    const submitButton = form.querySelector("button[type='submit']");
    const status = document.querySelector("#formStatus");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        form.classList.add("was-validated");
        if (!form.checkValidity()) {
            showStatus(status, "error", "Revisa los campos marcados antes de enviar.");
            return;
        }
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
        const payload = Object.fromEntries(new FormData(form).entries());

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const responseType = response.headers.get("content-type") || "";
            if (!responseType.includes("application/json")) {
                throw new Error("El backend no está disponible.");
            }

            const result = await response.json();
            if (!response.ok || !result.ok) {
                showStatus(status, "error", result.message || "No se pudo registrar la solicitud.");
                return;
            }
            showStatus(status, "success", result.message);
            form.reset();
            form.classList.remove("was-validated");
        } catch (_error) {
            saveDemoRegistration(payload);
            showStatus(status, "demo", "Modo demostración: el servidor PHP no está activo. Los datos se guardaron solo en este navegador para evidenciar el flujo del formulario.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Enviar solicitud";
        }
    });
}

function saveDemoRegistration(payload) {
    const safeCopy = { ...payload };
    delete safeCopy.website;
    safeCopy.createdAt = new Date().toISOString();
    try {
        const saved = JSON.parse(localStorage.getItem("harmonyDemoRegistrations") || "[]");
        saved.push(safeCopy);
        localStorage.setItem("harmonyDemoRegistrations", JSON.stringify(saved.slice(-10)));
    } catch (_error) {
        // El aviso visual sigue funcionando aunque el navegador bloquee localStorage.
    }
}

function showStatus(element, type, message) {
    element.className = `form-status show ${type}`;
    element.textContent = message;
    element.focus();
}

function mountUtilityTools() {
    const tools = document.createElement("div");
    tools.className = "utility-tools";
    tools.innerHTML = `
        <button class="utility-button" id="accessibilityButton" type="button" aria-expanded="false" aria-controls="accessibilityPanel">
            <span aria-hidden="true">Aa</span><span class="visually-hidden">Abrir opciones de accesibilidad</span>
        </button>
        <button class="utility-button" id="ambientButton" type="button" aria-pressed="false">
            <span aria-hidden="true">♪</span><span class="visually-hidden">Activar música ambiental</span>
        </button>
        <button class="utility-button back-to-top" id="backToTop" type="button">
            <span aria-hidden="true">↑</span><span class="visually-hidden">Volver arriba</span>
        </button>`;

    const panel = document.createElement("aside");
    panel.className = "accessibility-panel";
    panel.id = "accessibilityPanel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "accessibilityTitle");
    panel.innerHTML = `
        <div class="accessibility-header">
            <div><span class="utility-kicker">Preferencias</span><h2 id="accessibilityTitle">Accesibilidad</h2></div>
            <button class="panel-close" type="button" aria-label="Cerrar opciones de accesibilidad">×</button>
        </div>
        <div class="accessibility-group">
            <span class="setting-label">Tamaño del texto</span>
            <div class="font-controls" role="group" aria-label="Cambiar tamaño del texto">
                <button type="button" data-font-action="decrease" aria-label="Reducir texto">A−</button>
                <output id="fontScale" aria-live="polite">100%</output>
                <button type="button" data-font-action="increase" aria-label="Aumentar texto">A+</button>
            </div>
        </div>
        <div class="accessibility-options">
            <button type="button" data-a11y-toggle="contrast" aria-pressed="false"><span>◐</span>Alto contraste</button>
            <button type="button" data-a11y-toggle="grayscale" aria-pressed="false"><span>◉</span>Escala de grises</button>
            <button type="button" data-a11y-toggle="readable" aria-pressed="false"><span>Ab</span>Fuente legible</button>
            <button type="button" data-a11y-toggle="links" aria-pressed="false"><span>↗</span>Resaltar enlaces</button>
            <button type="button" data-a11y-toggle="motion" aria-pressed="false"><span>≈</span>Reducir movimiento</button>
        </div>
        <button class="reset-accessibility" type="button">Restablecer preferencias</button>`;

    document.body.append(tools, panel);
    const settings = loadAccessibilitySettings();
    applyAccessibilitySettings(settings, panel);

    const accessibilityButton = tools.querySelector("#accessibilityButton");
    const closeButton = panel.querySelector(".panel-close");
    const setPanel = (open) => {
        panel.hidden = !open;
        accessibilityButton.setAttribute("aria-expanded", open.toString());
        if (open) closeButton.focus();
    };

    accessibilityButton.addEventListener("click", () => setPanel(panel.hidden));
    closeButton.addEventListener("click", () => {
        setPanel(false);
        accessibilityButton.focus();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) {
            setPanel(false);
            accessibilityButton.focus();
        }
    });

    panel.querySelectorAll("[data-font-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const change = button.dataset.fontAction === "increase" ? 10 : -10;
            settings.fontScale = Math.max(90, Math.min(130, settings.fontScale + change));
            saveAndApplySettings(settings, panel);
        });
    });
    panel.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const key = button.dataset.a11yToggle;
            settings[key] = !settings[key];
            saveAndApplySettings(settings, panel);
        });
    });
    panel.querySelector(".reset-accessibility").addEventListener("click", () => {
        Object.assign(settings, defaultAccessibilitySettings());
        saveAndApplySettings(settings, panel);
    });

    const topButton = tools.querySelector("#backToTop");
    const updateTopButton = () => topButton.classList.toggle("show", window.scrollY > 500);
    window.addEventListener("scroll", updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener("click", () => {
        const behavior = settings.motion ? "auto" : "smooth";
        window.scrollTo({ top: 0, behavior });
        document.querySelector(".skip-link")?.focus({ preventScroll: true });
    });

    enableAmbientMusic(tools.querySelector("#ambientButton"));
}

function defaultAccessibilitySettings() {
    return { fontScale: 100, contrast: false, grayscale: false, readable: false, links: false, motion: false };
}

function loadAccessibilitySettings() {
    try {
        return { ...defaultAccessibilitySettings(), ...JSON.parse(localStorage.getItem("harmonyAccessibility") || "{}") };
    } catch (_error) {
        return defaultAccessibilitySettings();
    }
}

function saveAndApplySettings(settings, panel) {
    try {
        localStorage.setItem("harmonyAccessibility", JSON.stringify(settings));
    } catch (_error) {
        // Las preferencias siguen activas durante la sesión aunque no se puedan guardar.
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

function enableAmbientMusic(button) {
    let audioContext;
    let timer;
    let noteIndex = 0;
    const notes = [261.63, 329.63, 392, 493.88, 440, 329.63, 293.66, 392];
    const AudioEngine = window.AudioContext || window.webkitAudioContext;

    if (!AudioEngine) {
        button.disabled = true;
        button.querySelector(".visually-hidden").textContent = "Música ambiental no compatible con este navegador";
        return;
    }

    const playNote = () => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = noteIndex % 2 ? "sine" : "triangle";
        oscillator.frequency.value = notes[noteIndex % notes.length] / 2;
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.8);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1.9);
        noteIndex += 1;
    };

    button.addEventListener("click", async () => {
        const isPlaying = button.getAttribute("aria-pressed") === "true";
        if (isPlaying) {
            window.clearInterval(timer);
            if (audioContext) await audioContext.suspend();
            button.setAttribute("aria-pressed", "false");
            button.querySelector(".visually-hidden").textContent = "Activar música ambiental";
            return;
        }

        audioContext ??= new AudioEngine();
        await audioContext.resume();
        playNote();
        timer = window.setInterval(playNote, 1450);
        button.setAttribute("aria-pressed", "true");
        button.querySelector(".visually-hidden").textContent = "Detener música ambiental";
    });
}
