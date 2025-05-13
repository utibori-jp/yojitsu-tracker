import React, { useState } from "react";
import type { Todo } from "../types/todo";

const TodoForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<Todo, "id">>({
    name: "",
    description: "",
    estimatedTime: 0,
    actualTime: 0,
    dueDate: undefined,
    priority: "medium",
    status: "todo",
  });

  const submittedTodo = (todo: Todo) => {
    console.log("新しいTodo: ", todo);
    // TODO: ここでAPIにPOSTリクエストを送信する処理を追加
    // 例: axios.post("/api/todos", todo);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const parsers: Record<string, (val: string) => Date | number | undefined> =
      {
        dueDate: (val) => (val ? new Date(val) : undefined),
        estimatedTime: Number,
        actualTime: Number,
      };

    const parse = parsers[name] ?? ((val: string) => val);

    setFormData((prev) => ({
      ...prev,
      [name]: parse(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTodo: Todo = {
      ...formData,
    };
    submittedTodo(newTodo);
    // フォームを初期化（必要に応じて）
    setFormData({
      name: "",
      description: "",
      estimatedTime: 0,
      actualTime: 0,
      dueDate: undefined,
      priority: "medium",
      status: "todo",
    });
  };

  return (
    <div className="mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold">Todo 作成フォーム</h2>
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
            value={formData.description}
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
              value={
                formData.dueDate
                  ? formData.dueDate.toISOString().substring(0, 10)
                  : ""
              }
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
