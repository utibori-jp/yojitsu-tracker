import React, { useState } from "react";
import type { Todo } from "../types/todo";
import {
  PencilIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import IconButton from "./IconButton";
import { PRIORITY_LABELS } from "../constants/priority";
import { STATUS_LABELS } from "../constants/status";

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

  // className definition
  const badgeClass = "border rounded px-1";

  return (
    <div className="border border-gray-300 rounded-xl p-4 shadow-md bg-white mb-2">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">{todo.name}</h2>
        <div className="flex gap-2">
          <div>
            {status === "todo" || status === "pending" ? (
              <IconButton
                title="開始"
                onClick={handleStartStop}
                icon={PlayIcon}
                color="text-green-600"
              />
            ) : null}
            {status === "doing" ? (
              <IconButton
                title="一時停止"
                onClick={handleStartStop}
                icon={PauseIcon}
                color="text-yellow-600"
              />
            ) : null}
          </div>
          <IconButton
            title="完了"
            onClick={onCheck}
            icon={CheckCircleIcon}
            color="text-purple-600"
          />
          <IconButton
            title="削除"
            onClick={onDelete}
            icon={TrashIcon}
            color="text-red-600"
          />
          <IconButton
            title="編集"
            onClick={onEdit}
            icon={PencilIcon}
            color="text-blue-600"
          />
        </div>
      </div>
      <div className="flex space-x-4 mb-2">
        <div className={badgeClass}>{PRIORITY_LABELS[todo.priority]}</div>
        <div className={badgeClass}>{STATUS_LABELS[status]}</div>
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
