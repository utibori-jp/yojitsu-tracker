import React, { useState } from "react";
import type { TodoCreationRequest } from "../types/todo";
import { apiClient } from "../utils/apiClient";

const initialFormData: TodoCreationRequest = {
  name: "",
  description: "",
  estimatedTime: 0,
  dueDate: undefined,
  priority: "medium",
};

const TodoForm: React.FC = () => {
  const [formData, setFormData] =
    useState<TodoCreationRequest>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const parsers: Record<string, (val: string) => number | undefined> = {
      estimatedTime: Number,
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
      // TODO: エラーハンドリング
      // API call
      await apiClient.createTodo(formData);
    } catch (err) {
      console.error("Error submitting todo: ", err);
    }
    // フォームを初期化
    setFormData(initialFormData);
  };

  return (
    <div className="mx-auto border border-gray-300 bg-white p-6 rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">TodoCreationRequest 作成フォーム</h2>
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
            value={formData.description ?? initialFormData.description ?? ""}
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
              name="estimatedTime"
              onChange={handleChange}
              value={formData.estimatedTime}
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
              value={formData.dueDate ?? initialFormData.dueDate ?? ""}
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
              value={formData.priority ?? initialFormData.priority ?? "medium"}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold p-2 rounded-md hover:bg-blue-700"
        >
          タスク登録
        </button>
      </form>
    </div>
  );
};

export default TodoForm;
