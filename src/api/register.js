import axios from 'axios';

const apiUrl = process.env.VUE_APP_BACKEND_URL;

if (!apiUrl) {
  console.error('Backend URL is not defined. Please check your .env file.');
  throw new Error('Backend URL is not configured');
}

console.log('Backend URL:', apiUrl);

export const registerUser = async (userData) => {
  try {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('confirm_password', userData.confirm_password);

    const response = await axios.post(`${apiUrl}/registerUser`, formData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw {
        responseCode: error.response.data.responseCode || '1',
        responseMessage: error.response.data.responseMessage || 'Registration failed',
        errorMessage: error.response.data.errorMessage || 'An unexpected error occurred'
      };
    } else {
      throw {
        responseCode: '1',
        responseMessage: 'Registration failed',
        errorMessage: error.message || 'An unexpected error occurred'
      };
    }
  }
};