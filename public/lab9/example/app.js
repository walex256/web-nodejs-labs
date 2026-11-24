import { act, api, element, productCard, renderProducts } from "../ui.js";

const form = document.querySelector("#add");
const list = document.querySelector("#products");
const status = document.querySelector("#status");

async function load() {
  renderProducts(list, await api("products"), product => {
    const card = productCard(product);
    const remove = element("button", "Удалить");
    remove.addEventListener("click", () => {
      if (!confirm("Удалить товар «" + product.title + "»?")) return;
      act(status, async () => {
        await api("products/" + product.id, "DELETE");
        await load();
        return "Товар удалён.";
      }, [remove]);
    });
    card.append(remove);
    return card;
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const fields = new FormData(form);
  act(status, async () => {
    await api("products", "POST", {
      title: fields.get("title"),
      price: Math.round(Number(fields.get("price")) * 100),
      amount: Number(fields.get("amount")),
    });
    form.reset();
    await load();
    return "Товар добавлен.";
  }, [form.querySelector("button")]);
});
act(status, load);
