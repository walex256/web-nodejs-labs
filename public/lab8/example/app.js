import { postLab8, requestLab8 } from "../api.js";
import { renderList, run } from "../view.js";

const form = document.querySelector("#user-form");
const status = document.querySelector("#status");
const list = document.querySelector("#users");
const empty = document.querySelector("#empty");
const buttons = form.querySelectorAll("button");

async function loadUsers() {
  const users = await requestLab8("users");
  renderList(list, empty, users, ({ id, name, email }) => `${id}. ${name}, ${email}`);
  return "";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(form));
  run(status, async () => {
    const user = await postLab8("users", fields);
    form.reset();
    await loadUsers();
    return `Добавлен пользователь с ID ${user.id}.`;
  }, buttons);
});

run(status, loadUsers, buttons);
