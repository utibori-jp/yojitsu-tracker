import React from "react";
import type { Todo } from "../types/todo";

interface Props {
  todo: Todo;
}

const TodoItem: React.FC<Props> = ({ todo }) => {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white mb">
      <div className="mb-2">
        <h2 className="text-xl font-bold">{todo.name}</h2>
      </div>
      <div className="flex space-x-4 mb-2">
        <div className="border rounded px-1">{todo.priority.toUpperCase()}</div>
        <div className="border rounded px-1">{todo.status}</div>
        <div>期限: {todo.dueDate}</div>
      </div>
      <div>
        <div>
          予定: {todo.estimatedTime} 分 / 実績: {todo.actualTime} 分
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
