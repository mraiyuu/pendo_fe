import axios from 'axios';

const apiUrl = process.env.VUE_APP_BACKEND_URL;


if (!apiUrl) {
  console.error('Backend URL is not defined. Please check your .env file.');
  throw new Error('Backend URL is not configured');
}

console.log('Backend URL:', apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl,
});

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

export const checkAuthentication = () => {
  const token = localStorage.getItem('token');
  return !!token;
};


export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const { data } = await apiClient.post('/loginUser', formData);

    
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
export const getUserId = () => localStorage.getItem('user_id');

export const getToken = () => localStorage.getItem('token');
