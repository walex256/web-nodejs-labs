import { postLab8 } from "../api.js";
import { run } from "../view.js";

const button = document.querySelector("#build");
const status = document.querySelector("#status");

button.addEventListener("click", () => run(status, async () => {
  const { groups, stadiums } = await postLab8("task2/build");
  return `Файлы сформированы. Групп: ${groups}, стадионов: ${stadiums}.`;
}, [button]));
