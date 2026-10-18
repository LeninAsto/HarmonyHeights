import { createDialogController } from "./dialogos.js";

const tiles = [...document.querySelectorAll("[data-maquette]")];
const dialog = document.querySelector("#maquetteDialog");
const controller = createDialogController(dialog);
const image = document.querySelector("#maquetteImage");
let current = 0;
function show(index) {
  current = (index + tiles.length) % tiles.length;
  const original = tiles[current].querySelector("img");
  image.src = original.src;
  image.alt = original.alt;
  document.querySelector("#maquetteTitle").textContent = original.alt;
  document.querySelector("#maquetteCaption").textContent = `${current + 1} de ${tiles.length} · Imagen completa de la maquetación`;
  document.querySelector("#maquetteOriginal").href = original.src;
}
tiles.forEach((tile, index) => tile.addEventListener("click", () => { show(index); controller.open(); }));
document.querySelector("#maquettePrevious").addEventListener("click", () => show(current - 1));
document.querySelector("#maquetteNext").addEventListener("click", () => show(current + 1));
dialog.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
});
