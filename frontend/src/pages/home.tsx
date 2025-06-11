import TodoList from "../components/TodoList";
import TodoForm from "../components/TodoForm";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useState, useEffect } from "react";
import type { Todo, TodoCreationRequest } from "../types/todo";
import { apiClient } from "../utils/apiClient";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await apiClient.listTodos();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchTodos();
  }, []);

  const handleCreate = async (fields: TodoCreationRequest) => {
    try {
      const newTodo = await apiClient.createTodo(fields);
      setTodos((prev) => [...prev, newTodo]);
    } catch (error) {
      console.error("Create failed", error);
    }
  };

  const handleUpdate = async (updated: Todo) => {
    try {
      const updatedTodo = await apiClient.updateTodo(updated, {
        params: { todoId: updated.id },
      });
      setTodos((prev) =>
        prev.map((todo) => (todo.id === updated.id ? updatedTodo : todo))
      );
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteTodo(undefined, {
        params: { todoId: id },
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const doingTodos = todos.filter((todo) => todo.status !== "done");
  const doneTodos = todos.filter((todo) => todo.status === "done");

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
            <TodoForm onCreate={handleCreate} />
            <TodoList
              todos={doingTodos}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <TodoList
            todos={doneTodos}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </TabPanel>
      </Tabs>
    </main>
  );
}
