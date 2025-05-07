import React from "react";
import TodoList from "../components/TodoList";

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <TodoList />
    </main>
  );
};

export default Home;
