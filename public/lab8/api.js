export async function requestLab8(endpoint, options) {
  const response = await fetch(`/api/lab8/${endpoint}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    const message = data?.message ?? data?.error ?? "Не удалось выполнить запрос.";
    throw Object.assign(new Error(`Ошибка ${response.status}: ${message}`), { status: response.status });
  }
  if (data === null) throw new Error("Не удалось получить ответ сервера.");
  return data;
}

export function postLab8(endpoint, body) {
  const options = { method: "POST" };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return requestLab8(endpoint, options);
}
