"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";

export function LogoutButton() {
  const [isLoading, setIsLoading] = React.useState(false);
  const clearUser = useAuthStore((state) => state.clearUser);

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

      clearUser();
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
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      Logout
    </Button>
  );
}
