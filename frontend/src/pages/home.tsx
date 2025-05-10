import React from "react";
import TodoList from "../components/TodoList";
import { Todo } from "../types/todo";
import TodoForm from "../components/TodoForm";

const sampleTodos: Todo[] = [
  {
    id: 1,
    name: "デザイン確認",
    description: "トップページのUI確認",
    estimatedTime: 2,
    actualTime: 1,
    dueDate: "2025-05-15",
    priority: "medium",
    status: "todo",
  },
  {
    id: 2,
    name: "API実装",
    description: "タスク一覧取得のAPI実装",
    estimatedTime: 3,
    actualTime: 2.5,
    dueDate: "2025-05-16",
    priority: "high",
    status: "doing",
  },
];

const Home: React.FC = () => {
  return (
    <main>
      <div className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-white text-2xl fond-bold text-center">
          予実 Tracker
        </h1>
      </div>
      <div className="min-h-screen bg-gray-100 p-4 space-y-4">
        <TodoForm />
        <TodoList todos={sampleTodos} />
      </div>
    </main>
  );
};

export default Home;
