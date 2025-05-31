import React, { useState, useRef } from "react";
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
import { timeFormat } from "../utils/timeFormat";
import TodoForm from "./TodoForm";

interface Props {
  todo: Todo;
}

const TodoItem: React.FC<Props> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<Todo["status"]>(todo.status);
  const [actualTimeSec, setActualTimeSec] = useState(todo.actualTimeSec ?? 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // "TODO: 各ハンドルの実装"
  const onEdit = () => {
    console.log(`${todo.id}: Edit button clicked`);
    setIsEditing(true);
  };
  const onCheck = () => {
    console.log(`${todo.id}: Stop button clicked`);
    // TODO: API call to update status
  };
  const onDelete = () => {
    console.log(`${todo.id}: Delete button clicked`);
    // TODO: API call to delete the todo
  };

  const handleStartStop = () => {
    console.log(`${todo.id}: Start/Stop button clicked`);
    // TODO: 時間測定処理とAPIcallの実装
    if (status === "doing") {
      setStatus("pending");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // TODO: API call to update actualTimeSec
    } else {
      setStatus("doing");
      intervalRef.current = setInterval(() => {
        setActualTimeSec((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  // className definition
  const badgeClass = "border rounded px-1";

  return isEditing ? (
    <div>
      <TodoForm
        initialData={todo}
        onSubmitSuccess={() => {
          setIsEditing(false);
          // TODO: データ更新 or 再フェッチ
        }}
      />
    </div>
  ) : (
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
          予定: {todo.estimatedTimeSec} 分 / 実績: {timeFormat(actualTimeSec)}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
