export async function requestLab7(endpoint, params) {
  const response = await fetch(`/api/lab7/${endpoint}?${params}`);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || "Не удалось выполнить запрос.";
    throw new Error(`Ошибка ${response.status}: ${message}`);
  }

  if (data === null) {
    throw new Error("Не удалось получить ответ сервера.");
  }

  return data;
}
