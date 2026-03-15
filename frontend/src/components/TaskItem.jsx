import React from 'react';
import '../styles/TaskItem.css';

const TaskItem = ({ task, onEdit, onDelete, isLoading }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  const createdDate = new Date(task.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <span className="task-date">{createdDate}</span>
      </div>

      <div className="task-actions">
        <button
          className={`toggle-btn ${task.completed ? 'completed' : ''}`}
          onClick={() =>
            onEdit(task.id, { completed: !task.completed })
          }
          disabled={isLoading}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? '✓ Done' : 'Mark Done'}
        </button>

        <button
          className="edit-btn"
          onClick={() => onEdit(task.id, null)}
          disabled={isLoading}
          title="Edit task"
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={isLoading}
          title="Delete task"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
