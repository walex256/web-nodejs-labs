function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

async function calculate(request, reply) {
  const { operation, a, b } = request.query;

  if (!isNonEmptyString(a) || !isNonEmptyString(b)) {
    return reply.code(400).send({ error: "Укажите по одному значению a и b." });
  }

  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
    return reply.code(400).send({ error: "Параметры a и b должны быть конечными числами." });
  }

  let result;
  switch (operation) {
    case "add":
      result = numA + numB;
      break;
    case "subtract":
      result = numA - numB;
      break;
    case "multiply":
      result = numA * numB;
      break;
    case "divide":
      if (numB === 0) {
        return reply.code(400).send({ error: "Деление на ноль невозможно." });
      }
      result = numA / numB;
      break;
    default:
      return reply.code(400).send({ error: "Неизвестная операция." });
  }

  if (!Number.isFinite(result)) {
    return reply.code(400).send({ error: "Результат выходит за допустимый диапазон." });
  }

  return { operation, a: numA, b: numB, result };
}

function makeInitials({ lastname, firstname, patronymic }) {
  if (![lastname, firstname, patronymic].every(isNonEmptyString)) {
    return null;
  }

  return {
    lastname: lastname.trim(),
    firstnameLetter: Array.from(firstname.trim())[0].toUpperCase(),
    patronymicLetter: Array.from(patronymic.trim())[0].toUpperCase(),
  };
}

export default async function routes(fastify) {
  fastify.get("/", async () => ({
    lab: "№7",
    description: "Примеры API лабораторной работы №7",
  }));

  fastify.get("/hello", async () => ({ message: "Привет! Сервер Fastify работает." }));

  fastify.get("/status", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { status: "done", timestamp: new Date().toISOString() };
  });

  fastify.get("/calc", calculate);
  fastify.get("/task1", calculate);

  const nameError = "Укажите по одному непустому значению фамилии, имени и отчества.";

  fastify.get("/task2/makeInitials", async (request, reply) => {
    const initials = makeInitials(request.query);
    if (!initials) {
      return reply.code(400).send({ error: nameError });
    }
    return initials;
  });

  fastify.get("/task2/makeProjectStatus", async (request, reply) => {
    const initials = makeInitials(request.query);
    if (!initials) {
      return reply.code(400).send({ error: nameError });
    }

    const { projectParticipant } = request.query;
    if (projectParticipant !== "true" && projectParticipant !== "false") {
      return reply.code(400).send({ error: "Параметр projectParticipant должен быть true или false." });
    }

    return {
      ...initials,
      projectParticipant: projectParticipant === "true" ? "Участвует" : "Не участвует",
    };
  });
}
