import TodoItem from "./Todo";
import type { Todo } from "../types/todo";

interface Props {
  todos: Todo[];
}

const TodoList: React.FC<Props> = ({ todos }) => {
  if (todos.length === 0) {
    return <p className="text-center text-gray-500">タスクはありません。</p>;
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;
