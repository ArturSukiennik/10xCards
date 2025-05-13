import { useAuthStore } from "@/lib/stores/authStore";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function TopBar() {
  const user = useAuthStore((state) => state.user);

  return (
    <div data-test-id="top-bar" className="flex justify-between items-center p-4 border-b bg-white">
      <div className="font-bold text-lg">10xCards</div>
      <div className="flex items-center gap-4">
        <div data-test-id="user-menu" className="text-sm text-gray-600">
          {user?.email}
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
