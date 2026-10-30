import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useAuthStore = create((set) => ({
  // 1. Sahi keys use karni hain jo RequireAuth aur apiClient mein hain ('user', 'token')
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  // 2. UI se 'role' bhi backend ko bhejna zaroori hai
  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password, role });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  // 3. UI se name, email, password, badgeId, aur role sab lena zaroori hai
  register: async (name, email, password, badgeId, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', { 
        name, email, password, badgeId, role 
      });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  // 4. Perfect Logout Function
  logout: () => {
    // Storage saaf karo
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Zustand ka state reset karo
    set({ user: null, token: null, error: null });
    
    // Hard refresh ke sath login page par bhejo
    window.location.href = '/login';
  },
}));