import { readFile } from "node:fs/promises";
import path from "node:path";
import { dataDir, readJson, writeJson } from "./json-files.js";

const task2Dir = path.join(dataDir, "task2");
const groupsFile = path.join(task2Dir, "groups.json");
const stadiumsFile = path.join(task2Dir, "stadiums.json");
const resultsFile = path.join(dataDir, "task3", "resultsQatar22.json");
const months = { Nov: "11", Dec: "12" };

function chronological(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.group.localeCompare(b.group);
}

function parseCup(text) {
  const groups = new Map();
  let group;
  let date;
  let time;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const header = /^Group ([A-H])\s*\|\s*(.+)$/.exec(line);
    if (header) {
      const [, letter, teams] = header;
      groups.set(letter, { group: letter, teams: teams.split(/\s{2,}/), matches: [] });
      continue;
    }

    const section = /^▪\s+Group ([A-H])$/.exec(line);
    if (section) {
      group = groups.get(section[1]);
      date = time = undefined;
      continue;
    }

    const day = /^\w{3}\s+(Nov|Dec)\s+(\d{1,2})$/.exec(line);
    if (day) {
      date = `2022-${months[day[1]]}-${day[2].padStart(2, "0")}`;
      time = undefined;
      continue;
    }

    if (!line.includes("@")) continue;
    const match = /^(?:(\d{2}:\d{2})\s+)?(.+?)\s+(\d+)-(\d+)(?:\s+\(\d+-\d+\))?\s+(.+?)\s+@\s*(.+?),\s*(.+)$/.exec(line);
    if (!group || !date || !match || !(match[1] || time)) {
      throw new Error(`Не удалось разобрать строку матча: ${line}`);
    }

    const [, kickoff, team1, score1, score2, team2, stadium, city] = match;
    time = kickoff ?? time;
    group.matches.push({ date, time, team1, score1: Number(score1), score2: Number(score2), team2, stadium, city });
  }

  const result = [...groups.values()];
  if (result.length !== 8 || result.some(({ teams, matches }) =>
    teams.length !== 4 || matches.length !== 6 ||
    matches.some(({ team1, team2 }) => !teams.includes(team1) || !teams.includes(team2))
  )) {
    throw new Error("Ожидалось восемь групп с четырьмя командами и шестью матчами в каждой.");
  }
  return result;
}

function collectStadiums(groups) {
  const stadiums = new Map();
  for (const { group, matches } of groups) {
    for (const { stadium, city, ...match } of matches) {
      if (!stadiums.has(stadium)) stadiums.set(stadium, { stadium, city, matches: [] });
      stadiums.get(stadium).matches.push({ group, ...match });
    }
  }
  const result = [...stadiums.values()];
  if (result.length !== 8) throw new Error("Ожидалось восемь стадионов.");
  for (const stadium of result) stadium.matches.sort(chronological);
  return result;
}

export function getGroups() {
  return readJson(groupsFile);
}

export function getStadiums() {
  return readJson(stadiumsFile);
}

export function getResults() {
  return readJson(resultsFile);
}

export async function buildGroupsAndStadiums() {
  const groups = parseCup(await readFile(path.join(task2Dir, "cup.txt"), "utf8"));
  const stadiums = collectStadiums(groups);
  await Promise.all([writeJson(groupsFile, groups), writeJson(stadiumsFile, stadiums)]);
  return { groups: groups.length, stadiums: stadiums.length };
}

export async function buildResults() {
  const groups = await getGroups();
  if (!groups.length) return null;
  const results = groups.flatMap(({ group, matches }) =>
    matches.map(({ date, time, team1, score1, score2, team2, stadium }) =>
      ({ group, date, time, team1, score1, score2, team2, stadium })
    )
  ).sort(chronological);
  await writeJson(resultsFile, results);
  return results;
}
