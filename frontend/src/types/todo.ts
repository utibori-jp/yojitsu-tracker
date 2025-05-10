export interface Todo {
  id?: number;
  name: string;
  description?: string;
  estimatedTime: number;
  actualTime: number;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  status: "todo" | "doing" | "pending" | "done";
}
