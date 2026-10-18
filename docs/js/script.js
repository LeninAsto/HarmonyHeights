"use strict";

setCurrentYear();
markActiveNavigation();
selectProgramFromUrl();
enableProgramFilters();

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

function selectProgramFromUrl() {
  const programSelect = document.querySelector("#programa");
  if (!programSelect) return;

  const requestedProgram = new URLSearchParams(window.location.search).get(
    "programa",
  );
  for (const option of programSelect.options) {
    if (option.value === requestedProgram)
      programSelect.value = requestedProgram;
  }
}

function markActiveNavigation() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav .nav-link").forEach((link) => {
    const isActive = link.getAttribute("href").split("#")[0] === currentPage;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
  });
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
        const shouldShow =
          selectedCategory === "todos" ||
          card.dataset.category === selectedCategory;
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount += 1;
      });
      if (resultText) {
        resultText.textContent = `${visibleCount} programa${visibleCount === 1 ? "" : "s"} visible${visibleCount === 1 ? "" : "s"}`;
      }
    });
  });
}
