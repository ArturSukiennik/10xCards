import { useAuthStore } from "@/lib/stores/authStore";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function TopBar() {
  const user = useAuthStore((state) => state.user);

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
