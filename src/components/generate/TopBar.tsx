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
      <div className="font-bold text-lg">10xCards</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">{user?.email}</div>
        <LogoutButton />
      </div>
    </div>
  );
}
