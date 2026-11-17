const name = {
  type: "string",
  maxLength: 50,
  pattern: "\\S",
  not: { pattern: "\\p{Nd}" },
};
const names = { lastname: name, firstname: name, patronymic: name };
const nameFields = Object.keys(names);

export const initialsSchema = {
  querystring: {
    type: "object",
    required: nameFields,
    properties: names,
  },
};

export const statusSchema = {
  querystring: {
    type: "object",
    required: [...nameFields, "projectParticipant"],
    properties: {
      ...names,
      projectParticipant: { type: "string", enum: ["true", "false"] },
    },
  },
};

export const createRecordSchema = {
  body: {
    type: "object",
    required: [...nameFields, "gender", "faculty", "projectParticipant"],
    additionalProperties: false,
    properties: {
      ...names,
      gender: { type: "string", enum: ["male", "female"] },
      faculty: { type: "string", enum: ["it", "engineering", "economics"] },
      projectParticipant: { type: "boolean" },
      projectName: { type: ["string", "null"] },
    },
    if: {
      required: ["projectParticipant"],
      properties: { projectParticipant: { const: true } },
    },
    then: {
      required: ["projectName"],
      properties: { projectName: { type: "string", pattern: "\\S" } },
    },
  },
};
