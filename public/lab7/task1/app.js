import { requestLab7 } from "../api.js";

const form = document.querySelector("#calc-form");
const button = form.querySelector("button");
const output = document.querySelector("#result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const params = new URLSearchParams(new FormData(form));

  button.disabled = true;
  output.classList.remove("error");
  output.textContent = "Выполняется запрос...";

  try {
    const data = await requestLab7("task1", params);
    output.textContent = `Результат: ${data.result}`;
  } catch (error) {
    output.classList.add("error");
    output.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
