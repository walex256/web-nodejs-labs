import { act, api, renderProducts, showStock } from "../ui.js";

const form = document.querySelector("#search");
const status = document.querySelector("#status");
const list = document.querySelector("#products");
const buttons = form.querySelectorAll("button");

function search() {
  const q = form.elements.q.value.trim();
  const query = q ? "?" + new URLSearchParams({ q }) : "";
  act(status, async () => {
    const [products] = await Promise.all([
      api("task1/products" + query),
      showStock(document.querySelector("#stock")),
    ]);
    renderProducts(list, products);
  }, buttons);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  search();
});
document.querySelector("#reset").addEventListener("click", () => {
  form.reset();
  search();
});
search();
