import axios from 'axios'

export const fetchTasks = async (params = {}) => {
  try {
    const response = await axios.get('/api/tasks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post('/api/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axios.put(`/api/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
