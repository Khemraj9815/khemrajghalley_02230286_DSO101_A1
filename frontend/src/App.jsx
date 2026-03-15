import React, { useState, useEffect } from 'react';
import './App.css';
import { taskAPI } from './services/api';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getAllTasks();
      setTasks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await taskAPI.createTask({ title: input });
      setTasks([response.data.data, ...tasks]);
      setInput('');
      setError(null);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const response = await taskAPI.updateTask(taskId, { completed: !completed });
      setTasks(tasks.map((t) => (t.id === taskId ? response.data.data : t)));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1 className="app-title">Todo List</h1>
        
        <form onSubmit={handleAddTask} className="todo-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button type="submit" className="todo-button">Add</button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="todo-list">
          {tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Add one to get started!</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id, task.completed)}
                  className="todo-checkbox"
                />
                <span className={`todo-text ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="todo-delete"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
