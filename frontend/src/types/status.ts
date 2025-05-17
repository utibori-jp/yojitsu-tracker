import { z } from "zod";
import { schemas } from "../generated/api";
export type Status = z.infer<typeof schemas.Todo.shape.status>;
