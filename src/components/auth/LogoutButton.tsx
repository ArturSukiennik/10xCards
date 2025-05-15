"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";

export function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear auth store state
      setUser(null);

      // Dispatch logout event
      window.dispatchEvent(new CustomEvent("auth:logout"));

      // Clear local storage
      localStorage.clear();

      // Clear session storage
      sessionStorage.clear();

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      data-test-id="logout-button"
      variant="secondary"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="text-gray-600 hover:text-gray-900"
    >
      Logout
    </Button>
  );
}
