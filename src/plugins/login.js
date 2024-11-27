import axios from 'axios';

export function login(userCredentials) {
  return axios.post('https://localhost:7092/api/UserService/login', userCredentials)
    .then(response => response.data)
    .catch(error => {
      console.error('Login error:', error);
      throw error; // Hatanın üst kademeye iletilmesini sağlar
    });
}
