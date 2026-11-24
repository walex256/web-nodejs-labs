export const money = cents =>
  (cents / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function productCard(product) {
  const card = element("article", undefined, "panel product");
  card.append(
    element("h2", product.title),
    element("p", 'ID ' + product.id + ' · ' + money(product.price) + ' · На складе: ' + product.amount),
  );
  return card;
}

export function renderProducts(list, products, render = productCard) {
  list.replaceChildren(...(products.length ? products.map(render) : [element("p", "Товары не найдены.")]));
}

export async function api(endpoint, method = "GET", body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  const response = await fetch("/api/lab9/" + endpoint, options);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error('Ошибка ' + response.status + ': ' + (data.message ?? data.error));
    error.shortages = data.shortages;
    throw error;
  }
  return data;
}

export async function act(status, operation, buttons = []) {
  for (const button of buttons) button.disabled = true;
  status.classList.remove("error");
  status.textContent = "Подождите…";
  try {
    status.textContent = await operation() ?? "";
  } catch (error) {
    status.classList.add("error");
    status.textContent = error.shortages?.map(item =>
      (item.title ?? 'Товар ID ' + item.id) + ': нужно ' + item.requested + ', доступно ' + item.available + '.'
    ).join("\n") ?? error.message;
  } finally {
    for (const button of buttons) button.disabled = false;
  }
}

export async function showStock(node) {
  const stock = await api("task1/stock");
  node.textContent = 'Наименований: ' + stock.total_products + ' · На складе: ' +
    stock.total_items + ' шт. · Общая стоимость: ' + money(stock.total_value);
}
