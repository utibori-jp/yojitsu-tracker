import React, { useState } from "react";
import type { Todo } from "../types/todo";
import {
  PencilIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

interface Props {
  todo: Todo;
}

const TodoItem: React.FC<Props> = ({ todo }) => {
  const [status, setStatus] = useState<Todo["status"]>(todo.status);
  // "TODO: 各ハンドルの実装"
  const onEdit = () => {
    console.log(`${todo.id}: Edit button clicked`);
  };
  const onCheck = () => {
    console.log(`${todo.id}: Stop button clicked`);
  };
  const onDelete = () => {
    console.log(`${todo.id}: Delete button clicked`);
  };

  const handleStartStop = () => {
    console.log(`${todo.id}: Start/Stop button clicked`);
    // TODO: 時間測定処理とAPIcallの実装
    if (status === "doing") {
      setStatus("pending");
    } else {
      setStatus("doing");
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl p-4 shadow-md bg-white mb-2">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">{todo.name}</h2>
        <div className="flex gap-2">
          <div>
            {status === "todo" || status === "pending" ? (
              <button
                title="開始"
                onClick={handleStartStop}
                className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-green-600 rounded-lg p-2"
              >
                <PlayIcon className="h-5 w-5" />
              </button>
            ) : null}
            {status === "doing" ? (
              <button
                title="一時停止"
                onClick={handleStartStop}
                className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-yellow-600 rounded-lg p-2"
              >
                <PauseIcon className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          <button
            title="完了"
            onClick={onCheck}
            className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-purple-600 rounded-lg p-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
          </button>
          <button
            title="削除"
            onClick={onDelete}
            className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-red-600 rounded-lg p-2"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onEdit}
            className="border border-gray-300 bg-gray-100 hover:bg-gray-200 text-blue-600 rounded-lg p-2"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
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
