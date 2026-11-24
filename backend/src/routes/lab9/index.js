import * as products from "../../services/lab9/product.service.js";
import * as cartService from "../../services/lab9/cart.service.js";
import { cart, createProduct, productId, search, updateProduct } from "../../schemas/lab9/product.schema.js";

export default async function routes(app) {
  const db = app.pg;
  const byId = { schema: { params: productId } };
  const notFound = reply => reply.code(404).send({ error: "Product not found" });

  app.get("/products", async () => products.getAll(db));
  app.post("/products", { schema: { body: createProduct } }, async (request, reply) => {
    return reply.code(201).send(await products.create(db, request.body));
  });
  app.get("/products/:id", byId, async (request, reply) => {
    return await products.getOne(db, request.params.id) ?? notFound(reply);
  });
  app.delete("/products/:id", byId, async (request, reply) => {
    const deleted = await products.remove(db, request.params.id);
    return deleted ? { message: "Deleted", id: deleted.id } : notFound(reply);
  });
  app.patch("/products/:id", { schema: { params: productId, body: updateProduct } }, async (request, reply) => {
    if (!Object.keys(request.body).length) {
      return reply.code(400).send({ error: "Укажите хотя бы одно поле для изменения." });
    }
    return await products.update(db, request.params.id, request.body) ?? notFound(reply);
  });

  app.get("/task1/stock", async () => products.stock(db));
  app.get("/task1/products", { schema: { querystring: search } }, async request => {
    return products.getAll(db, request.query.q);
  });

  for (const action of ["check", "buy"]) {
    app.post("/task3/" + action, { schema: { body: cart } }, async (request, reply) => {
      const { items } = request.body;
      if (new Set(items.map(item => item.id)).size !== items.length) {
        return reply.code(400).send({ error: "Товар указан несколько раз." });
      }
      const result = action === "check"
        ? { shortages: await cartService.check(db, items) }
        : await cartService.buy(db, items);
      if (result.shortages?.length) {
        return reply.code(400).send({ error: "Товаров не хватает.", shortages: result.shortages });
      }
      return result;
    });
  }
}
