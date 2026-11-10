import { requestLab7 } from "../api.js";

const form = document.querySelector("#profile-form");
const checkbox = document.querySelector("#participant");
const projectField = document.querySelector("#project-field");
const initialsButton = document.querySelector("#initials");
const statusButton = document.querySelector("#project-status");
const output = document.querySelector("#result");

function toggleProjectField() {
  projectField.hidden = !checkbox.checked;
}

checkbox.addEventListener("change", toggleProjectField);
toggleProjectField();

async function showResult(withStatus) {
  if (!form.reportValidity()) return;

  const fields = new FormData(form);
  const params = new URLSearchParams();
  for (const name of ["lastname", "firstname", "patronymic"]) {
    params.set(name, fields.get(name));
  }
  if (withStatus) {
    params.set("projectParticipant", String(checkbox.checked));
  }

  initialsButton.disabled = statusButton.disabled = true;
  output.classList.remove("error");
  output.textContent = "Выполняется запрос...";

  try {
    const action = withStatus ? "makeProjectStatus" : "makeInitials";
    const data = await requestLab7(`task2/${action}`, params);
    const initials = `${data.lastname} ${data.firstnameLetter}.${data.patronymicLetter}.`;
    output.textContent = withStatus ? `${initials} — ${data.projectParticipant}` : initials;
  } catch (error) {
    output.classList.add("error");
    output.textContent = error.message;
  } finally {
    initialsButton.disabled = statusButton.disabled = false;
  }
}

initialsButton.addEventListener("click", () => showResult(false));
statusButton.addEventListener("click", () => showResult(true));
