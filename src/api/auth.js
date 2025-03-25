import axios from 'axios';

const apiUrl = process.env.VUE_APP_BACKEND_URL;

// Ensure the backend URL is configured
if (!apiUrl) {
  console.error('Backend URL is not defined. Please check your .env file.');
  throw new Error('Backend URL is not configured');
}

console.log('Backend URL:', apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl,
});

// Helper to handle errors consistently
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

// Login function (saves user_id and token to local storage)
export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const { data } = await apiClient.post('/loginUser', formData);

    // Save user_id and token to local storage
    if (data?.user?.user_id && data?.token) {
      localStorage.setItem('user_id', data.user.user_id);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('token', data.token);
    } else {
      throw new Error('Invalid login response');
    }

    return data;
  } catch (error) {
    handleApiError(error, 'Login failed');
  }
};

// Logout function{clears local storage}
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log(token)

    if (!token) {
      throw new Error('No token found. Please log in again.');
    }

    await apiClient.post('/logoutUser', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Clear user session data
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
  } catch (error) {
    handleApiError(error, 'Logout failed');
  }
};
// Helper to get user_id from local storage
export const getUserId = () => localStorage.getItem('user_id');

// Helper to get token from local storage
export const getToken = () => localStorage.getItem('token');
