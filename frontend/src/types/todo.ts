import { z } from "zod";
import { schemas } from "../generated/api";
export type Todo = z.infer<typeof schemas.Todo>;
export type TodoCreationRequest = z.infer<typeof schemas.TodoCreationRequest>;
