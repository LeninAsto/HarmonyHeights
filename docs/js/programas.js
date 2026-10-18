import { createDialogController } from "./dialogos.js";

const details = {
  piano: {
    category: "Música", area: "musica", age: "Desde 8 años", level: "Inicial e intermedio", mode: "Individual", duration: "50 minutos",
    description: "Construye una base musical paso a paso, con postura, coordinación de manos, lectura y piezas adaptadas a tu nivel.",
    learning: ["Ubicación en el teclado y postura cómoda.", "Lectura rítmica y melódica; coordinación de ambas manos.", "Armonía básica y repertorio progresivo."],
    preparation: "Trae ganas de escuchar y practicar. En la orientación podrás consultar el acceso al instrumento y cómo organizar la práctica en casa.",
  },
  guitarra: {
    category: "Música", area: "musica", age: "Desde 10 años", level: "Inicial e intermedio", mode: "Individual o grupal", duration: "60 minutos",
    description: "Aprende a acompañar canciones con ritmo y criterio musical, combinando acordes, técnica y entrenamiento del oído.",
    learning: ["Afinación, postura y cuidado del instrumento.", "Acordes, cambios y patrones de acompañamiento.", "Ritmo, escucha y repertorio elegido según tu progreso."],
    preparation: "Consulta durante la orientación qué guitarra conviene a tu edad y nivel. La experiencia previa no es necesaria para comenzar.",
  },
  canto: {
    category: "Música", area: "musica", age: "Desde 12 años", level: "Todos los niveles", mode: "Individual", duration: "50 minutos",
    description: "Explora tu voz con una práctica saludable de respiración, afinación e interpretación, respetando tu registro y ritmo de aprendizaje.",
    learning: ["Respiración y apoyo con conciencia corporal.", "Afinación, escucha y articulación.", "Interpretación de canciones y presencia al cantar."],
    preparation: "Trae agua y una canción que te guste. El docente orientará la elección de repertorio y los ejercicios adecuados para tu voz.",
  },
  urbana: {
    category: "Danza", area: "danza", age: "Desde 10 años", level: "Inicial e intermedio", mode: "Grupal", duration: "75 minutos",
    description: "Desarrolla coordinación, musicalidad y confianza a través del groove, las secuencias y la exploración de estilos urbanos.",
    learning: ["Calentamiento y control corporal.", "Ritmo, acentos y pasos fundamentales.", "Secuencias coreográficas y expresión personal."],
    preparation: "Usa ropa cómoda, zapatillas que permitan moverte con seguridad y lleva agua. La orientación inicial ayuda a elegir el grupo.",
  },
  ballet: {
    category: "Danza", area: "danza", age: "Desde 7 años", level: "Inicial", mode: "Grupal", duration: "60 minutos",
    description: "Descubre el vocabulario clásico mediante una progresión respetuosa de la alineación, la fuerza y la flexibilidad.",
    learning: ["Postura y alineación con conciencia corporal.", "Coordinación y posiciones básicas.", "Musicalidad, equilibrio y secuencias sencillas."],
    preparation: "Asiste con ropa que permita moverte libremente. Confirma con la academia el calzado y la indumentaria antes de comprarlos.",
  },
  escena: {
    category: "Escena", area: "escena", age: "Consultar grupo y edad", level: "Orientación inicial", mode: "Creación colectiva", duration: "Por confirmar en la apertura",
    description: "Un espacio interdisciplinario para conectar cuerpo, voz y ritmo mediante ejercicios de creación y presencia escénica.",
    learning: ["Exploración corporal y vocal.", "Escucha, improvisación y trabajo en equipo.", "Construcción de una propuesta escénica colectiva."],
    preparation: "La apertura del laboratorio depende de la conformación del grupo. Consulta fechas, duración y requisitos mediante el formulario.",
  },
};
const dialog = document.querySelector("#programDialog");
const controller = createDialogController(dialog, dialog.querySelector(".sheet-handle"));
for (const button of document.querySelectorAll("[data-program-detail]")) {
  button.addEventListener("click", () => {
    const detail = details[button.dataset.programDetail];
    const card = button.closest(".program-card");
    document.querySelector("#programDetailTitle").textContent = card.querySelector("h3").textContent;
    document.querySelector("#programDetailCategory").textContent = detail.category;
    document.querySelector("#programDetailSummary").textContent = detail.description;
    for (const key of ["age", "level", "mode", "duration"]) dialog.querySelector(`[data-program-fact="${key}"]`).textContent = detail[key];
    const list = document.querySelector("#programDetailLearning");
    list.replaceChildren(...detail.learning.map(text => { const li = document.createElement("li"); li.textContent = text; return li; }));
    document.querySelector("#programDetailPreparation").textContent = detail.preparation;
    document.querySelector("#programDetailContact").href = `contacto.html?programa=${detail.area}`;
    controller.open();
  });
}
