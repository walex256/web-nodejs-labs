import { postLab8, requestLab8 } from "../api.js";
import { run } from "../view.js";

const button = document.querySelector("#build");
const status = document.querySelector("#status");
const table = document.querySelector("#matches");

function resultClass(score1, score2) {
  if (score1 === score2) return "draw";
  return score1 > score2 ? "first-wins" : "second-wins";
}

function renderMatches(matches) {
  table.replaceChildren(...matches.map(match => {
    const { group, date, time, team1, score1, score2, team2, stadium } = match;
    const row = document.createElement("tr");
    row.classList.add(resultClass(score1, score2));
    for (const value of [group, date, time, team1, `${score1}:${score2}`, team2, stadium]) {
      row.insertCell().textContent = value;
    }
    return row;
  }));
  return matches.length ? `Матчей: ${matches.length}` : "Нажмите «Сформировать таблицу».";
}

button.addEventListener("click", () => run(status, async () => {
  return renderMatches(await postLab8("task3/build"));
}, [button]));

run(status, async () => renderMatches(await requestLab8("task3/results")), [button]);
