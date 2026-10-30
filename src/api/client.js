import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://ieg-backend.onrender.com/api/v1', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🛡️ REQUEST INTERCEPTOR: Attach the token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    // Read the token from local storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If token exists, attach it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🛑 RESPONSE INTERCEPTOR: Catch expired tokens and auto-logout
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // If the backend says "401 Unauthorized" (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");
      
      // Clear the invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect the user back to the login page safely
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);