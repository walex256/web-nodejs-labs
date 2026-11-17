import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import Fastify from "fastify";

const base = "/api/lab8/task1";
const names = { lastname: " Иванов ", firstname: " иван ", patronymic: " иванович " };
const initials = { lastname: "Иванов", firstnameLetter: "И", patronymicLetter: "И" };
const profile = { ...names, gender: "male", faculty: "it", projectParticipant: false };

test("ЛР №8, задание 1: валидация и сохранение анкет", async (t) => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "lab8-task1-"));
  let app;
  t.after(async () => {
    await app?.close();
    await rm(temp, { recursive: true, force: true });
  });

  // Отдельный каталог для проверки реальной записи без изменения локальных анкет.
  await cp(path.resolve(import.meta.dirname, "../src"), path.join(temp, "src"), { recursive: true });
  async function openServer() {
    const routes = pathToFileURL(path.join(temp, "src/routes/lab8/index.js"));
    const { default: lab8Routes } = await import(routes.href);
    const server = Fastify({ ajv: { customOptions: { coerceTypes: false } } });
    await server.register(lab8Routes, { prefix: "/api/lab8" });
    return server;
  }
  app = await openServer();

  function get(suffix, params = {}) {
    const query = new URLSearchParams(params);
    return app.inject({ method: "GET", url: `${base}/${suffix}?${query}` });
  }

  function save(payload) {
    return app.inject({
      method: "POST",
      url: `${base}/records`,
      headers: { "content-type": "application/json" },
      payload,
    });
  }

  await t.test("инициалы и оба статуса участия", async () => {
    const response = await get("makeInitials", names);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), initials);
    for (const [value, label] of [["true", "Участвует"], ["false", "Не участвует"]]) {
      const status = await get("makeProjectStatus", { ...names, projectParticipant: value });
      assert.equal(status.statusCode, 200);
      assert.deepEqual(status.json(), { ...initials, projectParticipant: label });
    }
  });

  await t.test("пустые, отсутствующие, длинные и повторяющиеся параметры дают 400", async () => {
    for (const field of Object.keys(names)) {
      const missing = { ...names };
      delete missing[field];
      const repeated = new URLSearchParams(names);
      repeated.append(field, "Дубль");
      for (const params of [missing, repeated, ...["", "   ", "а".repeat(51)].map(value => ({
        ...names, [field]: value,
      }))]) {
        assert.equal((await get("makeInitials", params)).statusCode, 400);
      }
    }
    assert.equal((await get("makeProjectStatus", { ...names, projectParticipant: "yes" })).statusCode, 400);
  });

  await t.test("ошибочный POST даёт 400 и не записывает анкету", async () => {
    const missing = Object.keys(profile).map(field => {
      const body = { ...profile };
      delete body[field];
      return body;
    });
    const invalid = [
      {}, [], ...missing, { ...profile, lastname: "" }, { ...profile, firstname: " " },
      { ...profile, firstname: 123 },
      { ...profile, patronymic: "а".repeat(51) },
      { ...profile, gender: "other" }, { ...profile, faculty: "unknown" },
      { ...profile, projectParticipant: "false" }, { ...profile, projectParticipant: 0 },
      ...[undefined, null, "", "   "].map(projectName => ({ ...profile, projectParticipant: true, projectName })),
    ];
    for (const body of invalid) {
      const response = await save(JSON.stringify(body));
      assert.equal(response.statusCode, 400, JSON.stringify(body));
      assert.ok(response.json().message);
    }
    assert.equal((await save("{")).statusCode, 400);
    const response = await get("records", profile);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), []);
    await assert.rejects(readFile(path.join(temp, "data/lab8/task1.json")), { code: "ENOENT" });
  });

  await t.test("цифры в любом поле ФИО отклоняются во всех трёх запросах", async () => {
    for (const field of Object.keys(names)) {
      for (const digit of ["7", "٧"]) {
        const invalid = { ...names, [field]: names[field].trim() + digit };
        assert.equal((await get("makeInitials", invalid)).statusCode, 400);
        assert.equal((await get("makeProjectStatus", { ...invalid, projectParticipant: "false" })).statusCode, 400);
        assert.equal((await save({ ...profile, ...invalid })).statusCode, 400);
      }
    }
    assert.deepEqual((await get("records")).json(), []);
  });

  await t.test("POST сохраняет анкету, возвращает 201, GET читает её после перезапуска", async () => {
    const expected = {
      id: 1, lastname: "Иванов", firstname: "иван", patronymic: "иванович",
      gender: "male", faculty: "it", projectParticipant: false, projectName: null,
    };
    const first = await save({ ...profile, projectName: "Лишнее название", id: 999, extra: true });
    assert.equal(first.statusCode, 201);
    assert.deepEqual(first.json(), expected);
    const second = await save({ ...profile, projectParticipant: true, projectName: " Проект " });
    assert.equal(second.statusCode, 201);
    const participant = { ...expected, id: 2, projectParticipant: true, projectName: "Проект" };
    assert.deepEqual(second.json(), participant);
    const third = await save({ ...profile, projectName: null });
    assert.equal(third.statusCode, 201);
    const records = [expected, participant, { ...expected, id: 3 }];
    const file = await readFile(path.join(temp, "data/lab8/task1.json"), "utf8");
    assert.deepEqual(JSON.parse(file), records);
    await app.close();
    app = await openServer();
    const loaded = await get("records");
    assert.equal(loaded.statusCode, 200);
    assert.deepEqual(loaded.json(), records);
  });
});
