import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/ui/Loader";
import { useAuth } from "../hooks/useAuth";

export default function RoleRoute({ allowedRole }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader text="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleType = user.roleType || user.role;

  if (roleType !== allowedRole) {
    if (roleType === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (roleType === "executive") {
      return <Navigate to="/executive" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}