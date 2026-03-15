require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'todo_db',
  port: process.env.DB_PORT || 5432,
});

// Initialize database tables
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET task by ID
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ success: false, error: 'Invalid task ID' });
  }

  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new task
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;

  // Validate input
  if (!title || title.trim().length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'Title is required' });
  }

  if (title.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Title must be less than 255 characters',
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  // Validate ID
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ success: false, error: 'Invalid task ID' });
  }

  // Validate input
  if (title && title.length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Title must be less than 255 characters',
    });
  }

  try {
    // Check if task exists
    const checkResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Task not found' });
    }

    // Prepare update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      updateValues.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(description);
      paramIndex++;
    }

    if (completed !== undefined) {
      updateFields.push(`completed = $${paramIndex}`);
      updateValues.push(completed);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 1) {
      // Only updated_at, no other changes
      const result = await pool.query(
        `UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id]
      );
      return res.json({
        success: true,
        message: 'Task updated successfully',
        data: result.rows[0],
      });
    }

    const updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(updateQuery, [
      ...updateValues,
      id,
    ]);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ success: false, error: 'Invalid task ID' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});
