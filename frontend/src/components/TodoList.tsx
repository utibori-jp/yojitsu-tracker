import React, { useState } from "react";
import TodoItem from "./Todo";
import type { Todo } from "../types/todo";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, title: "買い物に行く", completed: false },
    { id: 2, title: "宿題をやる", completed: true },
  ]);

  const handleToggle = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded p-4">
      <h1 className="text-2xl font-bold mb-4">ToDo リスト</h1>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default TodoList;
