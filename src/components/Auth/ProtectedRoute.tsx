import { useAppSelector } from "../../store/hooks";
import { Outlet } from "react-router-dom";
import Redirect from "../common/Redirect.tsx";
import type { UserRole } from "../../types/User.ts";

interface Props {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
