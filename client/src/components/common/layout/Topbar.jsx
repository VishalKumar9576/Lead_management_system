import { Menu, LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../../hooks/useAuth";

export default function Topbar({ onMenuClick, panelLabel = "Panel" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-3">
          <button
  type="button"
  onClick={onMenuClick}
  className="relative z-50 border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
>
            <Menu size={18} />
          </button>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {panelLabel}
            </p>
            <h1 className="text-sm font-semibold text-gray-900 sm:text-base">
              Welcome back
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
         <div className="hidden items-center gap-3 border border-gray-200 bg-gray-50 px-3 py-2 sm:flex">
           <div className="bg-blue-100 p-2 text-blue-600">
              <UserCircle2 size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">
                {user?.full_name || "Executive"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.executive_code || user?.phone || "Field User"}
              </p>
            </div>
          </div>

          <Button
  variant="primary"
  onClick={handleLogout}
  className="relative z-50 px-3 sm:px-4"
>
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}