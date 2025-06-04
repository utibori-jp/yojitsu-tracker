import React from "react";
import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useState, useEffect } from "react";
import type { Todo } from "../types/todo";
import { apiClient } from "../utils/apiClient";

const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    // TODO: エラーハンドリング
    const fetchTodos = async () => {
      setTodos(await apiClient.listTodos());
    };
    fetchTodos();
  }, []);

  const handleUpdateTodos = (updatedTodo: Todo) => {
    setTodos((prev) => [...prev, updatedTodo]);
  };

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
            <TodoForm onSubmitSuccess={handleUpdateTodos} />
            <TodoList todos={todos} />
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
