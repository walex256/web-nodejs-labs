import { act, api, element, productCard, renderProducts, showStock } from "../ui.js";

const lookup = document.querySelector("#lookup");
const list = document.querySelector("#products");
const status = document.querySelector("#status");
let selectedId;

function labeledInput(label, value, options) {
  const wrapper = element("label", label, "field");
  const input = Object.assign(document.createElement("input"), { required: true, value, ...options });
  wrapper.append(input);
  return { wrapper, input };
}

function editableCard(product) {
  const card = productCard(product);
  const form = document.createElement("form");
  const title = labeledInput("Название", product.title, { maxLength: 255 });
  const price = labeledInput("Цена, ₽", (product.price / 100).toFixed(2), {
    type: "number", min: "0", max: "21474836.47", step: "0.01",
  });
  const amount = element("output", product.amount);
  amount.setAttribute("aria-label", "Остаток");
  const row = element("div", undefined, "row");
  const decrease = element("button", "−");
  const increase = element("button", "+");
  const save = element("button", "Сохранить");
  const message = element("p", undefined, "status product-status");
  message.setAttribute("role", "status");
  decrease.type = increase.type = "button";
  decrease.setAttribute("aria-label", "Уменьшить остаток");
  increase.setAttribute("aria-label", "Увеличить остаток");
  let draftAmount = product.amount;
  function changeAmount(delta) {
    draftAmount = Math.max(0, Math.min(2147483647, draftAmount + delta));
    amount.textContent = draftAmount;
  }
  decrease.addEventListener("click", () => changeAmount(-1));
  increase.addEventListener("click", () => changeAmount(1));
  row.append(decrease, amount, increase, save);
  form.append(title.wrapper, price.wrapper, row, message);
  card.append(form);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const draft = { title: title.input.value.trim(), price: Math.round(Number(price.input.value) * 100), amount: draftAmount };
    const changes = Object.fromEntries(Object.entries(draft).filter(([key, value]) => product[key] !== value));
    act(message, async () => {
      if (!Object.keys(changes).length) return "Изменений нет.";
      const updated = await api("products/" + product.id, "PATCH", changes);
      const fresh = editableCard(updated);
      card.replaceWith(fresh);
      await act(fresh.querySelector(".product-status"), async () => {
        await showStock(document.querySelector("#stock"));
        return "Изменения сохранены.";
      }, fresh.querySelectorAll("button"));
    }, [decrease, increase, save]);
  });
  return card;
}

function load() {
  act(status, async () => {
    list.replaceChildren();
    const [products] = await Promise.all([
      selectedId ? api("products/" + selectedId).then(product => [product]) : api("products"),
      showStock(document.querySelector("#stock")),
    ]);
    renderProducts(list, products, editableCard);
  }, lookup.querySelectorAll("button"));
}

lookup.addEventListener("submit", event => {
  event.preventDefault();
  const input = lookup.elements.id;
  selectedId = input.value === "" ? undefined : input.valueAsNumber;
  load();
});
document.querySelector("#reset").addEventListener("click", () => {
  lookup.reset();
  selectedId = undefined;
  load();
});
load();
