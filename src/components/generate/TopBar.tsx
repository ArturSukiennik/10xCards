import { useAuthStore } from "@/lib/stores/authStore";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useEffect } from "react";

export function TopBar() {
  const user = useAuthStore((state) => state.user);

  // Debug info - usuń po rozwiązaniu problemu
  useEffect(() => {
    console.log("TopBar user state:", user);
  }, [user]);

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <div className="text-sm text-gray-600 font-medium">
        {user?.email ? `Logged in as: ${user.email}` : "Not logged in"}
      </div>
      <div>
        <LogoutButton />
      </div>
    </div>
  );
}
