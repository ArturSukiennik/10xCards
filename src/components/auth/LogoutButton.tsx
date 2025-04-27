"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
        const error = await response.json();
        throw new Error(error.message || "Failed to logout");
      }

      // Clear user from store
      setUser(null);

      // Clear local storage
      localStorage.clear();

      // Redirect to login page
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
