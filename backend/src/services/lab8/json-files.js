import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const dataDir = path.resolve(import.meta.dirname, "../../../data/lab8");

export async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(data, null, 2) + "\n", "utf8");
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

export function jsonCollection(filename) {
  const file = path.join(dataDir, filename);
  let pending = Promise.resolve();

  return {
    list: () => readJson(file),
    add(fields) {
      // Сериализуем чтение и запись, чтобы одновременные POST не теряли записи.
      const operation = pending.then(async () => {
        const records = await readJson(file);
        const id = records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
        const record = { ...fields, id };
        await writeJson(file, [...records, record]);
        return record;
      });
      pending = operation.catch(() => {});
      return operation;
    },
  };
}
