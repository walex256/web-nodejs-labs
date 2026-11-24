import path from "node:path";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyPostgres from "@fastify/postgres";
import dotenv from "dotenv";
import lab7Routes from "./src/routes/lab7/index.js";
import lab8Routes from "./src/routes/lab8/index.js";
import lab9Routes from "./src/routes/lab9/index.js";

dotenv.config({ path: path.join(import.meta.dirname, ".env.local"), quiet: true });

const fastify = Fastify({
  logger: true,
  ajv: { customOptions: { coerceTypes: false } },
});

fastify.register(fastifyPostgres, { connectionString: process.env.DATABASE_URL });

fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, "..", "public"),
  redirect: true,
});
fastify.register(lab7Routes, { prefix: "/api/lab7" });
fastify.register(lab8Routes, { prefix: "/api/lab8" });
fastify.register(lab9Routes, { prefix: "/api/lab9" });

await fastify.listen({ port: 3000, host: "0.0.0.0" });
