import axios from   "axios";
import { create } from "zustand";

export const useAuth = create((set) => ({

  isAuthenticated: false,
  currentUser: null,
  loading: false,
  error: null,

  login: async (userCred) => {
    try {
      set({ loading: true, error: null });

      //
      const res = axios.post("http://localhost:5000/api/auth/login", userCred);

      set({
        isAuthenticated: true, 
        currentUser: res.data.user,
        loading: false
      });

      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false
      });

      return false;
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null
    });
  }

}));