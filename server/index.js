const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("../database.sqlite", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Get all doors
app.get("/api/doors", (req, res) => {
  db.all(
    "SELECT doors.id, doors.door_num AS name, rooms.room_name AS location FROM doors JOIN rooms ON doors.room_id = rooms.id",
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get all groups
app.get("/api/groups", (req, res) => {
  db.all("SELECT id, group_name AS name FROM groups", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all permissions
app.get("/api/permissions", (req, res) => {
  db.all(
    "SELECT door_id AS doorId, group_id AS groupId FROM auths",
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add permission
app.post("/api/permissions", (req, res) => {
  const { doorId, groupId } = req.body;
  db.run(
    "INSERT INTO auths (door_id, group_id) VALUES (?, ?)",
    [doorId, groupId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Remove permission
app.delete("/api/permissions", (req, res) => {
  const { doorId, groupId } = req.body;
  db.run(
    "DELETE FROM auths WHERE door_id = ? AND group_id = ?",
    [doorId, groupId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
