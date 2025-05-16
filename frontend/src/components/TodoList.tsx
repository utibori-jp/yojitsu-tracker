import TodoItem from "./Todo";
import { useState, useEffect } from "react";
import type { Todo } from "../types/todo";
import { apiClient } from "../utils/apiClient";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    // TODO: エラーハンドリング
    const fetchTodos = async () => {
      setTodos(await apiClient.listTodos());
    };
    fetchTodos();
  }, []);

  if (todos.length === 0) {
    return <p className="text-center">タスクはありません。</p>;
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;
