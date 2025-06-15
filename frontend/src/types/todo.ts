import { z } from "zod";
import { schemas } from "../generated/api";
export type Todo = z.infer<typeof schemas.Todo>;
export type TodoCreationRequest = z.infer<typeof schemas.TodoCreationRequest>;
export type TodoUpdateRequest = z.infer<typeof schemas.TodoUpdateRequest>;
