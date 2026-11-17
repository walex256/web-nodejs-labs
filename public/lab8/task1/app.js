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
const facultyLabels = Object.fromEntries(
  [...form.elements.faculty.options].map(option => [option.value, option.textContent])
);

function syncProject() {
  projectField.hidden = project.disabled = !checkbox.checked;
  project.required = checkbox.checked;
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
    const data = await requestLab8(`task1/${endpoint}?${query}`);
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
    const record = await postLab8("task1/records", fields);
    form.reset();
    syncProject();
    await loadRecords();
    return `Запись №${record.id} сохранена.`;
  }, buttons);
});

run(status, loadRecords, buttons);
