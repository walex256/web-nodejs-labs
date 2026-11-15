import { jsonCollection } from "./json-files.js";

const users = jsonCollection("users.json");

export const getAllUsers = users.list;

export function createUser({ name, email }) {
  return users.add({ name: name.trim(), email });
}
