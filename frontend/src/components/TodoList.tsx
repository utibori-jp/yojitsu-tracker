import TodoItem from "./Todo";
import type { Todo } from "../types/todo";

interface Props {
  todos: Todo[];
  onUpdate: (updated: Todo) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<Props> = ({ todos, onUpdate, onDelete }) => {
  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TodoList;
