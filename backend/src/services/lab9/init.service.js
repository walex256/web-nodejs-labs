import { readFile } from "node:fs/promises";

const migration = new URL("../../../sql/lab9.sql", import.meta.url);

async function initialize(db) {
  const { rows: [row] } = await db.query("SELECT to_regclass('lab9.products') AS products");
  if (!row.products) {
    await db.query(await readFile(migration, "utf8"));
  }
}

export function ensureCatalog(db) {
  let pending;
  return async () => {
    pending ??= initialize(db).catch(error => {
      pending = undefined;
      throw error;
    });
    await pending;
  };
}

export function databaseErrorMessage(error) {
  switch (error.code) {
    case "42501":
      return "У пользователя PostgreSQL нет нужных прав. Проверьте права на схему lab9 и таблицу products.";
    case "42P01":
    case "3F000":
      return "Каталог ЛР №9 отсутствует. Выполните backend/sql/lab9.sql в базе приложения.";
    case "28P01":
    case "28000":
    case "3D000":
      return "PostgreSQL отклонил подключение. Проверьте пользователя, пароль и имя базы в DATABASE_URL.";
    case "ECONNREFUSED":
    case "ECONNRESET":
    case "ETIMEDOUT":
    case "ENOTFOUND":
    case "EAI_AGAIN":
    case "57P01":
    case "57P03":
      return "Не удалось подключиться к PostgreSQL. Проверьте DATABASE_URL и доступность базы.";
    default:
      return undefined;
  }
}
