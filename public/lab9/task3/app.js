import { act, api, element, productCard, renderProducts } from "../ui.js";
import { readCart, writeCart } from "./storage.js";

const status = document.querySelector("#status");
const link = document.querySelector("#cart-link");

function updateCount() {
  const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
  link.textContent = "Моя корзина (" + count + ")";
}

function add(product) {
  const items = readCart();
  const item = items.find(entry => entry.id === product.id);
  if (item?.quantity === 5) return "В корзине уже 5 шт. этого товара.";
  if (item) item.quantity++;
  else items.push({ id: product.id, quantity: 1 });
  writeCart(items);
  updateCount();
  return "Добавлено в корзину: " + product.title;
}

window.addEventListener("pageshow", updateCount);
updateCount();
act(status, async () => {
  const products = await api("products");
  renderProducts(document.querySelector("#products"), products, product => {
    const card = productCard(product);
    const button = element("button", "Добавить в корзину");
    button.disabled = product.amount === 0;
    button.addEventListener("click", () => act(status, () => add(product), [button]));
    card.append(button);
    return card;
  });
});
