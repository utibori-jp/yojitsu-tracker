import React, { useState } from "react";
import type { TodoCreationRequest, Todo } from "../types/todo";
import { PRIORITY_LABELS, PRIORITY_ORDER } from "../constants/priority";

interface Props {
  initialData?: Todo; // 編集時用
  onCreate?: (updated: TodoCreationRequest) => void;
  onUpdate?: (updated: Todo) => void;
  cancel?: () => void;
}

const defaultFormData: Todo = {
  id: 0,
  name: "",
  description: "",
  estimatedTimeSec: 60,
  actualTimeSec: 0,
  priority: "medium",
  status: "todo",
  createdAt: "",
  updatedAt: "",
  reflectionMemo: undefined,
};

const TodoForm: React.FC<Props> = ({
  initialData,
  onCreate,
  onUpdate,
  cancel,
}) => {
  const [formData, setFormData] = useState<Todo>(
    initialData ?? defaultFormData
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const parsers: Record<string, (val: string) => number | undefined> = {
      // 分から秒への変換
      estimatedTimeSec: (val: string) => Number(val) * 60,
    };

    const parse = parsers[name] ?? ((val: string) => val);

    setFormData((prev) => ({
      ...prev,
      [name]: parse(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData && onUpdate) {
        // 編集モード
        onUpdate(formData);
      } else if (onCreate) {
        // 新規作成
        const payload: TodoCreationRequest = {
          name: formData.name,
          description: formData.description,
          estimatedTimeSec: formData.estimatedTimeSec,
          dueDate: formData.dueDate,
          priority: formData.priority,
        };
        onCreate(payload);
      }
      // フォームを初期化
      setFormData(defaultFormData);
    } catch (err) {
      console.error("Error submitting todo: ", err);
    }
  };

  return (
    <div className="mx-auto border border-gray-300 bg-white p-6 rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {initialData ? null : (
          <h2 className="text-2xl font-bold">タスク作成</h2>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例：資料作成"
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            詳細
          </label>
          <textarea
            name="description"
            value={formData.description ?? defaultFormData.description ?? ""}
            onChange={handleChange}
            placeholder="タスクの詳細な内容..."
            className="w-full border border-gray-300 p-2 rounded-md"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              予定時間 (分)
            </label>
            <input
              type="number"
              name="estimatedTimeSec"
              onChange={handleChange}
              value={formData.estimatedTimeSec / 60}
              className="w-full border border-gray-300 p-2 rounded-md"
              min={0}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期限
            </label>
            <input
              type="date"
              name="dueDate"
              onChange={handleChange}
              value={formData.dueDate ?? defaultFormData.dueDate ?? ""}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <select
              name="priority"
              onChange={handleChange}
              value={formData.priority}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              {PRIORITY_ORDER.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {initialData?.status === "done" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              反省メモ
            </label>
            <textarea
              name="reflectionMemo"
              value={formData.reflectionMemo ?? ""}
              onChange={handleChange}
              placeholder="このタスクの振り返り..."
              className="w-full border border-gray-300 p-2 rounded-md"
              rows={3}
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold p-2 rounded-md hover:bg-green-700"
          >
            {initialData ? "更新する" : "登録する"}
          </button>
          {initialData ? (
            <button
              onClick={cancel}
              className="w-full bg-gray-100 text-black font-bold p-2 rounded-md hover:bg-gray-200 border border-gray-300"
            >
              キャンセル
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
