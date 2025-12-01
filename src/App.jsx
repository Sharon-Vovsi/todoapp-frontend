import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";

function App() {
  console.log("Component rendering…");
  const [inputTodo, setInputTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editTodo, setEditTodo] = useState({
    id: null,
    desc: "",
    completed: false,
  });

  // Load todos on mount
  useEffect(() => {
    async function fetchTodos() {
      try {
        const resp = await axios.get("/todos");
        setTodos(resp.data || []);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      }
    }
    fetchTodos();
  }, []);

  // Add new todo
  async function addTodo() {
    console.log("ADD TODO CLICKED");   // <-- Put this at the first line
    if (!inputTodo.trim()) return;

    try {
      const resp = await axios.post("/todos", {
        desc: inputTodo,
        completed: false,
      });
      console.log("POST /todos response:", resp.data);  // <-- ADD THIS
      if (resp.data.success) {
        setTodos((prev) => [...prev, resp.data.newTodo]);
      }
      console.log("POST RESPONSE:", resp.data); // <-- ADD THIS
    } catch (err) {
      console.error("Failed to add todo:", err);
    }

    setInputTodo("");
  }

  // Enter edit mode
  function enableEdit(todo) {
    setEditMode(true);
    setEditTodo({
      id: todo.todo_id,
      desc: todo.todo_desc,
      completed: !!todo.todo_completed,
    });
  }

  // Update todo
  async function updateTodo(e) {
    e.preventDefault();

    try {
      const resp = await axios.put(`/todos/${editTodo.id}`, {
        desc: editTodo.desc,
        completed: editTodo.completed,
      });

      if (resp.data.success) {
        setTodos((prev) =>
          prev.map((t) =>
            t.todo_id === editTodo.id
              ? {
                  ...t,
                  todo_desc: editTodo.desc,
                  todo_completed: editTodo.completed,
                }
              : t
          )
        );
      }

      setEditMode(false);
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }

  // Delete one todo
  async function deleteTodo(todo) {
    try {
      const resp = await axios.delete(`/todos/${todo.todo_id}`);

      if (resp.data.success) {
        setTodos((prev) => prev.filter((t) => t.todo_id !== todo.todo_id));
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }

  // Delete all todos
  async function clearAllTodos() {
    try {
      await axios.delete("/delete");
      setTodos([]);
    } catch (err) {
      console.error("Failed to clear todos:", err);
    }
  }

  // ----------------- EDIT MODE VIEW -----------------

  if (editMode) {
    return (
      <form
        onSubmit={updateTodo}
        className="flex flex-col items-center gap-8 pt-8 pb-24 bg-blue-50"
      >
        <div className="text-2xl">Edit Todo</div>

        <div className="flex gap-4">
          <label className="text-xl">Description:</label>
          <input
            className="text-xl rounded-lg shadow-md"
            type="text"
            value={editTodo.desc}
            onChange={(e) =>
              setEditTodo({ ...editTodo, desc: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4">
          <label className="text-xl">Completed:</label>
          <input
            type="checkbox"
            checked={editTodo.completed}
            onChange={(e) =>
              setEditTodo({ ...editTodo, completed: e.target.checked })
            }
          />
        </div>

        <button className="bg-green-600 hover:bg-green-500 text-white py-1 px-2 rounded-md">
          Save Changes
        </button>
      </form>
    );
  }

  // ----------------- MAIN VIEW -----------------

  return (
    <div className="flex flex-col items-center gap-8 pt-8 pb-32 bg-blue-50">
      <div className="text-2xl">Todo List PostgreSQL</div>

      <div className="flex gap-2">
        <input
          className="text-xl rounded-lg shadow-md"
          type="text"
          placeholder="Enter Todo"
          value={inputTodo}
          onChange={(e) => setInputTodo(e.target.value)}
        />
        <button
          onClick={addTodo}
          className="text-lg bg-red-600 hover:bg-red-500 text-white py-1 px-2 rounded-xl"
        >
          Add
        </button>
        <button
          onClick={clearAllTodos}
          className="text-lg bg-gray-500 hover:bg-gray-400 text-white py-1 px-2 rounded-xl"
        >
          Clear
        </button>
      </div>

      {todos.length > 0 && (
        <div className="flex flex-col gap-2 border bg-blue-200 rounded-lg p-2 w-5/6">
          {todos.map((todo) => (
            <div
              className="flex items-center justify-between bg-blue-700 rounded-md p-2 text-white"
              key={todo.todo_id}
            >
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={!!todo.todo_completed}
                  readOnly
                />
                <div className="text-lg">{todo.todo_desc}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => enableEdit(todo)}
                  className="bg-green-600 hover:bg-green-500 text-white py-1 px-2 rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo)}
                  className="bg-red-600 hover:bg-red-500 text-white py-1 px-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;