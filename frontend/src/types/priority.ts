import { z } from "zod";
import { schemas } from "../generated/api";
export type Priority = z.infer<typeof schemas.Todo.shape.priority>;
