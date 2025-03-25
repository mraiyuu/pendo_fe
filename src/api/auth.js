import axios from 'axios';

const apiUrl = process.env.VUE_APP_BACKEND_URL;

if (!apiUrl) {
  console.error('Backend URL is not defined. Please check your .env file.');
  throw new Error('Backend URL is not configured');
}

console.log('Backend URL:', apiUrl);

const apiClient = axios.create({
  baseURL: `${apiUrl}`, 
});

export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await apiClient.post('/loginUser', formData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw {
        responseCode: error.response.data.responseCode || '1',
        responseMessage: error.response.data.responseMessage || 'Login failed',
        errorMessage: error.response.data.errorMessage || 'An unexpected error occurred',
      };
    } else {
      throw {
        responseCode: '1',
        responseMessage: 'Login failed',
        errorMessage: error.message || 'An unexpected error occurred',
      };
    }
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/logoutUser');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw {
        responseCode: error.response.data.responseCode || '1',
        responseMessage: error.response.data.responseMessage || 'Logout failed',
        errorMessage: error.response.data.errorMessage || 'An unexpected error occurred',
      };
    } else {
      throw {
        responseCode: '1',
        responseMessage: 'Logout failed',
        errorMessage: error.message || 'An unexpected error occurred',
      };
    }
  }
};
