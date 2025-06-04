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
import { apiClient } from "../utils/apiClient";

interface Props {
  todo: Todo;
}

const TodoItem: React.FC<Props> = ({ todo: initialTodo }) => {
  const [todo, setTodo] = useState<Todo>(initialTodo);
  const [isEditing, setIsEditing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // "TODO: 各ハンドルの実装"
  const onEdit = () => {
    console.log(`${todo.id}: Edit button clicked`);
    setIsEditing(true);
  };
  const onCheck = async () => {
    console.log(`${todo.id}: Stop button clicked`);
    const updated = await apiClient.updateTodo(
      { status: "done" },
      {
        params: { todoId: todo.id },
      }
    );
    setTodo(updated);
  };
  const onDelete = async () => {
    await apiClient.deleteTodo(undefined, { params: { todoId: todo.id } });
  };

  const handleStartStop = async () => {
    if (todo.status === "doing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const updated = await apiClient.updateTodo(
        { status: "pending", actualTimeSec: todo.actualTimeSec },
        {
          params: { todoId: todo.id },
        }
      );
      setTodo(updated);
      console.log(updated);
      console.log(todo);
    } else {
      intervalRef.current = setInterval(() => {
        setTodo((prev) => ({
          ...prev,
          actualTimeSec: prev.actualTimeSec + 1,
        }));
      }, 1000);
      console.log(todo);
      const updated = await apiClient.updateTodo(
        { status: "doing" },
        {
          params: { todoId: todo.id },
        }
      );
      console.log(todo);
      console.log(updated);
      setTodo(updated);
    }
  };

  // className definition
  const badgeClass = "border rounded px-1";

  return isEditing ? (
    <div>
      <TodoForm
        initialData={todo}
        onSubmitSuccess={(updatedTodo:Todo) => {
          setTodo(updatedTodo)
          setIsEditing(false);
        }}
        cancel={()=>{
          setIsEditing(false);
        }}
      />
    </div>
  ) : (
    <div className="border border-gray-300 rounded-xl p-4 shadow-md bg-white mb-2">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">{todo.name}</h2>
        <div className="flex gap-2">
          <div>
            {todo.status === "todo" || todo.status === "pending" ? (
              <IconButton
                title="開始"
                onClick={handleStartStop}
                icon={PlayIcon}
                color="text-green-600"
              />
            ) : null}
            {todo.status === "doing" ? (
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
        <div className={badgeClass}>{STATUS_LABELS[todo.status]}</div>
        <div>期限: {todo.dueDate}</div>
      </div>
      <div>
        <div>
          予定: {todo.estimatedTimeSec / 60} 分 / 実績:{" "}
          {timeFormat(todo.actualTimeSec)}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
