import { postLab8, requestLab8 } from "../api.js";
import { renderList, run } from "../view.js";

const form = document.querySelector("#profile-form");
const status = document.querySelector("#status");
const list = document.querySelector("#records");
const empty = document.querySelector("#empty");
const buttons = form.querySelectorAll("button");
const checkbox = form.elements.projectParticipant;
const project = form.elements.projectName;
const projectField = document.querySelector("#project-field");
const nameFields = ["lastname", "firstname", "patronymic"].map(name => {
  const input = form.elements[name];
  const hint = document.createElement("span");
  hint.id = `${name}-error`;
  hint.className = "field-error";
  hint.hidden = true;
  input.after(hint);
  input.setAttribute("aria-describedby", hint.id);
  return { input, hint };
});
const facultyLabels = Object.fromEntries(
  [...form.elements.faculty.options].map(option => [option.value, option.textContent])
);

function syncProject() {
  projectField.hidden = project.disabled = !checkbox.checked;
  project.required = checkbox.checked;
}

function showNameError({ input, hint }) {
  const value = input.value;
  const message = !value.trim() ? "Заполните это поле."
    : /\p{Nd}/u.test(value) ? "Уберите цифры из этого поля." : "";
  hint.textContent = message;
  hint.hidden = !message;
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  return Boolean(message);
}

async function checkNamesAndRequest(request) {
  const invalid = nameFields.filter(showNameError);
  try {
    return await request();
  } catch (error) {
    if (error.status !== 400 || !invalid.length) throw error;
    invalid[0].input.focus();
    throw new Error("Проверьте выделенные поля ФИО.");
  }
}

for (const field of nameFields) {
  field.input.addEventListener("input", () => {
    if (!field.hint.hidden) showNameError(field);
  });
}

function describe({ id, lastname, firstname, patronymic, gender, faculty, projectParticipant, projectName }) {
  const participation = projectParticipant ? `Участвует в проекте «${projectName}»` : "Не участвует в проекте";
  const genderLabel = gender === "male" ? "Мужской" : "Женский";
  return `${id}. ${lastname} ${firstname} ${patronymic} · ${genderLabel} · ${facultyLabels[faculty]} · ${participation}`;
}

async function loadRecords() {
  const records = await requestLab8("task1/records");
  renderList(list, empty, records, describe);
  return "";
}

function showInitials(withStatus) {
  const { lastname, firstname, patronymic } = Object.fromEntries(new FormData(form));
  const query = new URLSearchParams({ lastname, firstname, patronymic });
  const endpoint = withStatus ? "makeProjectStatus" : "makeInitials";
  if (withStatus) query.set("projectParticipant", String(checkbox.checked));

  run(status, async () => {
    const data = await checkNamesAndRequest(() => requestLab8(`task1/${endpoint}?${query}`));
    const initials = `${data.lastname} ${data.firstnameLetter}.${data.patronymicLetter}.`;
    return withStatus ? `${initials} — ${data.projectParticipant}` : initials;
  }, buttons);
}

checkbox.addEventListener("change", syncProject);
syncProject();
document.querySelector("#initials").addEventListener("click", () => showInitials(false));
document.querySelector("#project-status").addEventListener("click", () => showInitials(true));

form.noValidate = true;
form.addEventListener("submit", event => {
  event.preventDefault();
  form.reportValidity();
  const fields = Object.fromEntries(new FormData(form));
  fields.projectParticipant = checkbox.checked;
  fields.projectName = checkbox.checked ? project.value : null;

  run(status, async () => {
    const record = await checkNamesAndRequest(() => postLab8("task1/records", fields));
    form.reset();
    syncProject();
    await loadRecords();
    return `Запись №${record.id} сохранена.`;
  }, buttons);
});

run(status, loadRecords, buttons);
