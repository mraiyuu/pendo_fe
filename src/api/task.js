import axios from 'axios';
import { getToken, getUserId } from './auth';

const apiUrl = process.env.VUE_APP_BACKEND_URL;

if (!apiUrl) {
  console.error('Backend URL is not defined. Please check your .env file.');
  throw new Error('Backend URL is not configured');
}

const apiClient = axios.create({
  baseURL: apiUrl,
});

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleApiError = (error, defaultMessage) => {
  if (error.response?.data) {
    const { responseCode = '1', responseMessage = defaultMessage, errorMessage = 'An unexpected error occurred' } = error.response.data;
    throw { responseCode, responseMessage, errorMessage };
  } else {
    throw {
      responseCode: '1',
      responseMessage: defaultMessage,
      errorMessage: error.message || 'An unexpected error occurred',
    };
  }
};


export const createTask = async (taskData) => {
  try {
    const userId = getUserId();
    const userEmail = localStorage.getItem('email'); 

    if (!userId) throw new Error('User ID not found. Please log in again.');
    if (!userEmail) throw new Error('User email not found. Please log in again.');

    const completeTaskData = {
      user_id: userId,
      email: userEmail,
      ...taskData
    };

    const response = await apiClient.post('/createTask', completeTaskData, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error creating task');
  }
};

export const fetchTasks = async (params = {}) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User ID not found. Please log in again.');

    const response = await apiClient.get('/getAllTask', {
      headers: getAuthHeaders(),
      params: { user_id: userId, ...params },
    });

    const { tasks, pagination } = response.data;
    return { tasks, pagination };
  } catch (error) {
    handleApiError(error, 'Error fetching tasks');
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User ID not found. Please log in again.');

    const response = await apiClient.patch(`/updateTask`, { user_id: userId, ...taskData }, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error updating task');
  }
};




export const deleteTask = async (taskId) => {
  try {
    const response = await apiClient.delete('/deleteTask', {
      headers: getAuthHeaders(),
      params: {
        task_id: taskId,
      },
    });

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error deleting task');
  }
};