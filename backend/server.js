import path from "node:path";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import lab7Routes from "./src/routes/lab7/index.js";

const fastify = Fastify({ logger: true });

fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, "..", "public"),
  redirect: true,
});
fastify.register(lab7Routes, { prefix: "/api/lab7" });

await fastify.listen({ port: 3000, host: "0.0.0.0" });
