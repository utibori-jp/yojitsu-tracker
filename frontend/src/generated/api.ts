import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Todo = z
  .object({
    id: z.number().int(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullish(),
    estimatedTime: z.number().int().gte(1),
    actualTime: z.number().int().gte(0).optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
      .nullish(),
    priority: z.enum(["high", "medium", "low"]),
    status: z.enum(["todo", "doing", "pending", "done"]),
    reflectionMemo: z.string().max(2000).nullish(),
  })
  .passthrough();
const Error = z
  .object({ code: z.number().int(), message: z.string() })
  .passthrough();
const TodoCreationRequest = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullish(),
    estimatedTime: z.number().int().gte(1),
    dueDate: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
      .nullish(),
    priority: z.enum(["high", "medium", "low"]).nullish().default("medium"),
  })
  .passthrough();

export const schemas = {
  Todo,
  Error,
  TodoCreationRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/todos",
    alias: "listTodos",
    description: `Retrieves a list of all TODO items.`,
    requestFormat: "json",
    response: z.array(Todo),
    errors: [
      {
        status: 500,
        description: `Internal Server Error`,
        schema: Error,
      },
    ],
  },
  {
    method: "post",
    path: "/todos",
    alias: "createTodo",
    description: `Adds a new TODO item to the list.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `TODO item to create.`,
        type: "Body",
        schema: TodoCreationRequest,
      },
    ],
    response: Todo,
    errors: [
      {
        status: 400,
        description: `Invalid input provided.`,
        schema: Error,
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: Error,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
