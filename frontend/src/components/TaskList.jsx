import React, { useState } from 'react';
import '../styles/TaskList.css';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onEdit, onDelete, isLoading }) => {
  const [filterCompleted, setFilterCompleted] = useState(null);

  const filteredTasks = filterCompleted === null 
    ? tasks 
    : tasks.filter(task => task.completed === filterCompleted);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <div className="task-stats">
          <span className="stat">
            Total: <strong>{totalCount}</strong>
          </span>
          <span className="stat">
            Completed: <strong>{completedCount}</strong>
          </span>
        </div>
      </div>

      <div className="task-filters">
        <button
          className={`filter-btn ${filterCompleted === null ? 'active' : ''}`}
          onClick={() => setFilterCompleted(null)}
        >
          All Tasks
        </button>
        <button
          className={`filter-btn ${filterCompleted === false ? 'active' : ''}`}
          onClick={() => setFilterCompleted(false)}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filterCompleted === true ? 'active' : ''}`}
          onClick={() => setFilterCompleted(true)}
        >
          Completed
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>
            {totalCount === 0
              ? '🎉 No tasks yet. Create one to get started!'
              : 'No tasks in this category'}
          </p>
        </div>
      ) : (
        <div className="tasks">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
