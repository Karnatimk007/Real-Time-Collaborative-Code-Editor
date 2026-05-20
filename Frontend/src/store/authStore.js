import { create } from "zustand";
import { API } from "../services/apis";

export const useAuth = create((set) => ({

  isAuthenticated: !!localStorage.getItem("token"),
  currentUser: JSON.parse(localStorage.getItem("user") || "null"),
  loading: false,
  error: null,

  login: async (userCred) => {
    try {
      set({ loading: true, error: null });

      const res = await API.post("/auth/login", userCred);

      // Persist to localStorage so refresh keeps you logged in
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      set({
        isAuthenticated: true,
        currentUser: res.data.user,
        loading: false,
      });

      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      isAuthenticated: false,
      currentUser: null,
    });
  },

}));