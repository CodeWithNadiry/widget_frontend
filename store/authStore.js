import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, user) => {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        set({ token, user });
      },

      clearAuth: () => {
        document.cookie = "token=; path=/; max-age=0";
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);