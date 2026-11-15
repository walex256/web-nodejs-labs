import { jsonCollection } from "./json-files.js";

const records = jsonCollection("task1.json");

export const getRecords = records.list;

function trimNames({ lastname, firstname, patronymic }) {
  return { lastname: lastname.trim(), firstname: firstname.trim(), patronymic: patronymic.trim() };
}

export function makeInitials(profile) {
  const { lastname, firstname, patronymic } = trimNames(profile);
  return {
    lastname,
    firstnameLetter: Array.from(firstname)[0].toUpperCase(),
    patronymicLetter: Array.from(patronymic)[0].toUpperCase(),
  };
}

export function makeProjectStatus(profile) {
  return {
    ...makeInitials(profile),
    projectParticipant: profile.projectParticipant === "true" ? "Участвует" : "Не участвует",
  };
}

export function createRecord(profile) {
  const { gender, faculty, projectParticipant, projectName } = profile;
  return records.add({
    ...trimNames(profile),
    gender,
    faculty,
    projectParticipant,
    projectName: projectParticipant ? projectName.trim() : null,
  });
}
