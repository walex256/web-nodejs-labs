import { act, api, element, money, productCard } from "../ui.js";
import { readCart, writeCart } from "./storage.js";

const list = document.querySelector("#products");
const total = document.querySelector("#total");
const status = document.querySelector("#status");
const check = document.querySelector("#check");
const buy = document.querySelector("#buy");
let items = readCart();
let products = new Map();

function refreshTotal() {
  const value = items.reduce((sum, item) => sum + (products.get(item.id)?.price ?? 0) * item.quantity, 0);
  total.textContent = "Итого: " + money(value);
  if (items.some(item => !products.has(item.id))) {
    total.textContent += " · Недоступные товары не включены.";
  }
  check.disabled = buy.disabled = !items.length;
}

function render() {
  list.replaceChildren(...items.map(item => {
    const product = products.get(item.id);
    const card = product ? productCard(product) : element("article", "Товар ID " + item.id + " больше недоступен.", "panel product");
    const label = element("label", "Количество", "field");
    const select = document.createElement("select");
    for (let count = 1; count <= 5; count++) select.add(new Option(count, count));
    select.value = item.quantity;
    select.addEventListener("change", () => {
      item.quantity = Number(select.value);
      writeCart(items);
      refreshTotal();
      status.textContent = "";
    });
    label.append(select);
    const remove = element("button", "Удалить из корзины");
    remove.addEventListener("click", () => {
      items = items.filter(entry => entry.id !== item.id);
      writeCart(items);
      status.textContent = "";
      render();
    });
    card.append(label, remove);
    return card;
  }));
  if (!items.length) list.append(element("p", "Корзина пуста."));
  refreshTotal();
}

async function order(action) {
  const controls = [check, buy, ...list.querySelectorAll("button, select")];
  await act(status, async () => {
    const result = await api("task3/" + action, "POST", { items });
    if (action === "check") return "Все товары в наличии. Можно купить.";
    items = [];
    writeCart(items);
    render();
    return "Покупка завершена. Оплачено " + money(result.total) + ".";
  }, controls);
  refreshTotal();
}

check.addEventListener("click", () => order("check"));
buy.addEventListener("click", () => order("buy"));

act(status, async () => {
  products = new Map((await api("products")).map(product => [product.id, product]));
  render();
});
