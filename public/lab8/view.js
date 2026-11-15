export async function run(status, action, buttons = []) {
  for (const button of buttons) button.disabled = true;
  status.classList.remove("error");
  status.textContent = "Выполняется запрос...";
  try {
    status.textContent = await action();
  } catch (error) {
    status.classList.add("error");
    status.textContent = error.message;
  } finally {
    for (const button of buttons) button.disabled = false;
  }
}

export function renderList(list, empty, records, describe) {
  list.replaceChildren(...records.map(record => {
    const item = document.createElement("li");
    item.textContent = describe(record);
    return item;
  }));
  empty.hidden = records.length > 0;
}
