export const createUserSchema = {
  body: {
    type: "object",
    required: ["name", "email"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 2, maxLength: 100, pattern: "\\S" },
      email: { type: "string", format: "email", maxLength: 100 },
    },
  },
};
