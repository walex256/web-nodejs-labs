const integerMax = 2147483647;
const quantity = { type: "integer", minimum: 0, maximum: integerMax };
const properties = {
  title: { type: "string", maxLength: 255, pattern: "^\\s*[^\\s\\u0000][^\\u0000]*$" },
  price: quantity,
  amount: quantity,
};

export const productId = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string", pattern: "^[1-9][0-9]{0,9}$" } },
};

export const createProduct = {
  type: "object",
  required: ["title", "price", "amount"],
  properties,
  additionalProperties: false,
};

export const updateProduct = {
  type: "object",
  minProperties: 1,
  properties,
  additionalProperties: false,
};

export const search = {
  type: "object",
  properties: { q: { type: "string", pattern: "^(?=.*\\S)[^\\u0000]+$", maxLength: 255 } },
};

export const cart = {
  type: "object",
  required: ["items"],
  additionalProperties: false,
  properties: {
    items: {
      type: "array", minItems: 1, maxItems: 100,
      items: {
        type: "object", required: ["id", "quantity"], additionalProperties: false,
        properties: {
          id: { type: "integer", minimum: 1, maximum: integerMax },
          quantity: { type: "integer", minimum: 1, maximum: 5 },
        },
      },
    },
  },
};
