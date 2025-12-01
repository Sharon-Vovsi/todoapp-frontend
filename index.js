const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const pool = require("./db.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Home Page" });
});

app.get("/todos", async (req, res) => {
    try {
        const todos = await pool.query("SELECT * FROM todo_table");
        res.json(todos.rows);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/todos", async (req, res) => {
    try {
        const { desc, completed } = req.body;

        // Validation
        if (!desc || desc.trim() === "") {
            return res.status(400).json({ success: false, error: "desc is required" });
        }

        const newTodo = await pool.query(
            "INSERT INTO todo_table (todo_desc, todo_completed) VALUES ($1, $2) RETURNING *",
            [desc, completed ?? false]
        );

        res.json({ success: true, newTodo: newTodo.rows[0], msg: "Todo Added" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.get("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await pool.query(
            "SELECT * FROM todo_table WHERE todo_id = $1",
            [id]
        );
        res.json(todo.rows[0] || null);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { desc, completed } = req.body;

        if (!desc || desc.trim() === "") {
            return res.status(400).json({ success: false, error: "desc is required" });
        }

        const updateTodo = await pool.query(
            "UPDATE todo_table SET todo_desc = $1, todo_completed = $2 WHERE todo_id = $3 RETURNING *",
            [desc, completed ?? false, id]
        );

        res.json({ success: true, updated: updateTodo.rows[0], msg: "Todo Updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const delTodo = await pool.query(
            "DELETE FROM todo_table WHERE todo_id = $1 RETURNING *",
            [id]
        );
        res.json({ success: true, msg: "Todo Deleted", deleted: delTodo.rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete("/todos", async (req, res) => {
    try {
        const delAllTodos = await pool.query("DELETE FROM todo_table RETURNING *");
        res.json({ success: true, msg: "All Todos Deleted", deleted: delAllTodos.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// duplicate route to match client-side `/delete` call if used
app.delete("/delete", async (req, res) => {
    try {
        const delAllTodos = await pool.query("DELETE FROM todo_table RETURNING *");
        res.json({ success: true, msg: "All Todos Deleted", deleted: delAllTodos.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});