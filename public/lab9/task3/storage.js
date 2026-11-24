const key = "lab9-cart";

export function readCart() {
  try {
    const data = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(data) ? data.filter(item =>
      Number.isInteger(item?.id) && item.id > 0 &&
      Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 5
    ) : [];
  } catch {
    return [];
  }
}

export function writeCart(items) {
  localStorage.setItem(key, JSON.stringify(items));
}
