export async function requestLab7(endpoint, params) {
  const response = await fetch(`/api/lab7/${endpoint}?${params}`);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok || data === null) {
    throw new Error(data?.error || "Не удалось получить ответ сервера.");
  }

  return data;
}
