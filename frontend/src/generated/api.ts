import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Todo = z
  .object({
    id: z.number().int(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullish(),
    estimatedTimeSec: z.number().int().gte(1),
    actualTimeSec: z.number().int().gte(0),
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
    estimatedTimeSec: z.number().int().gte(1),
    dueDate: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
      .nullish(),
    priority: z.enum(["high", "medium", "low"]).nullish().default("medium"),
  })
  .passthrough();
const TodoUpdateRequest = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).nullable(),
    estimatedTimeSec: z.number().int().gte(1),
    actualTimeSec: z.number().int().gte(0).nullable(),
    dueDate: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
      .nullable(),
    priority: z.enum(["high", "medium", "low"]).nullable(),
    status: z.enum(["todo", "doing", "pending", "done"]),
    reflectionMemo: z.string().max(2000).nullable(),
  })
  .partial()
  .passthrough();

export const schemas = {
  Todo,
  Error,
  TodoCreationRequest,
  TodoUpdateRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/todos",
    alias: "listTodos",
    description: `Retrieves a list of all TODO items.`,
    requestFormat: "json",
    parameters: [
      {
        name: "status",
        type: "Query",
        schema: z.enum(["todo", "doing", "pending", "done"]).optional(),
      },
      {
        name: "priority",
        type: "Query",
        schema: z.enum(["high", "medium", "low"]).optional(),
      },
      {
        name: "dueDate",
        type: "Query",
        schema: z
          .string()
          .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
          .optional(),
      },
      {
        name: "name",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
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
    ],
  },
  {
    method: "put",
    path: "/todos/:todoId",
    alias: "updateTodo",
    description: `Updates an existing TODO item by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        description: `TODO item data to update. At least one field must be provided.`,
        type: "Body",
        schema: TodoUpdateRequest,
      },
      {
        name: "todoId",
        type: "Path",
        schema: z.number().int(),
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
        status: 404,
        description: `TODO item not found.`,
        schema: Error,
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: Error,
      },
    ],
  },
  {
    method: "delete",
    path: "/todos/:todoId",
    alias: "deleteTodo",
    description: `Deletes a TODO item by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "todoId",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `TODO item not found.`,
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
