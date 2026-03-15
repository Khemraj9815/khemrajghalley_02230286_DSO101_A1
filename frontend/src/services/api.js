import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://be-todo-02230286.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Task API endpoints
export const taskAPI = {
  // Get all tasks
  getAllTasks: () => api.get('/tasks'),

  // Get task by ID
  getTaskById: (id) => api.get(`/tasks/${id}`),

  // Create new task
  createTask: (taskData) => api.post('/tasks', taskData),

  // Update task
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),

  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;
