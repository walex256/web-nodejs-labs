import { createRecordSchema, initialsSchema, statusSchema } from "../../schemas/lab8/profile.schema.js";
import { createUserSchema } from "../../schemas/lab8/user.schema.js";
import { buildGroupsAndStadiums, buildResults, getGroups, getResults, getStadiums } from "../../services/lab8/cup.service.js";
import { createRecord, getRecords, makeInitials, makeProjectStatus } from "../../services/lab8/profile.service.js";
import { createUser, getAllUsers } from "../../services/lab8/user.service.js";

export default async function routes(fastify) {
  fastify.get("/users", async () => getAllUsers());
  fastify.post("/users", { schema: createUserSchema }, async (request, reply) => {
    return reply.code(201).send(await createUser(request.body));
  });

  fastify.get("/task1/makeInitials", { schema: initialsSchema }, async (request) => {
    return makeInitials(request.query);
  });
  fastify.get("/task1/makeProjectStatus", { schema: statusSchema }, async (request) => {
    return makeProjectStatus(request.query);
  });
  fastify.get("/task1/records", async () => getRecords());
  fastify.post("/task1/records", { schema: createRecordSchema }, async (request, reply) => {
    return reply.code(201).send(await createRecord(request.body));
  });

  fastify.post("/task2/build", async () => buildGroupsAndStadiums());
  fastify.get("/task2/groups", async () => getGroups());
  fastify.get("/task2/stadiums", async () => getStadiums());

  fastify.post("/task3/build", async (request, reply) => {
    const results = await buildResults();
    if (!results) {
      return reply.code(409).send({ error: "Сначала сформируйте файлы в задании 2." });
    }
    return results;
  });
  fastify.get("/task3/results", async () => getResults());
}
