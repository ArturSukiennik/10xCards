import { create } from "zustand";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()((set) => {
  // Only add event listeners in browser environment
  if (typeof window !== "undefined") {
    // Listen for auth events
    window.addEventListener("auth:login", ((event: CustomEvent<{ user: AuthUser }>) => {
      set({ user: event.detail.user, isAuthenticated: true });
    }) as EventListener);

    window.addEventListener("auth:logout", (() => {
      set({ user: null, isAuthenticated: false });
    }) as EventListener);
  }

  return {
    user: null,
    isAuthenticated: false,
    setUser: (user: AuthUser | null) =>
      set(() => ({
        user,
        isAuthenticated: !!user,
      })),
    clearUser: () => set(() => ({ user: null, isAuthenticated: false })),
  };
});
