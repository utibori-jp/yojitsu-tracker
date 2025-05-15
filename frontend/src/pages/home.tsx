import React from "react";
import TodoList from "../components/TodoList";
import { Todo } from "../types/todo";
import TodoForm from "../components/TodoForm";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

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
    <main className="bg-gray-200 min-h-screen">
      <div className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-white text-2xl font-bold text-center">
          予実 Tracker
        </h1>
      </div>

      <Tabs className="p-4 max-w-5xl mx-auto">
        <TabList>
          <Tab>実行中タスク</Tab>
          <Tab>完了タスク</Tab>
        </TabList>

        <TabPanel>
          <div className="space-y-4 mt-4">
            <TodoForm />
            <TodoList todos={sampleTodos} />
          </div>
        </TabPanel>
        <TabPanel>
          <h2>コンテンツ未実装</h2>
        </TabPanel>
      </Tabs>
    </main>
  );
};

export default Home;
