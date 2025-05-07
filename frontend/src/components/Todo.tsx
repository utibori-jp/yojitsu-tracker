import React from "react";
import type { Todo } from "../types/todo";

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<Props> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="flex justify-between items-center p-2 border-b">
      <div
        className={`cursor-pointer ${
          todo.completed ? "line-through text-gray-400" : ""
        }`}
        onClick={() => onToggle(todo.id)}
      >
        {todo.title}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-500 hover:text-red-700"
      >
        削除
      </button>
    </div>
  );
};

export default TodoItem;
