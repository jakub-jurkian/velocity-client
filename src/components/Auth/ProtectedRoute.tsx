import { useAppSelector } from "../../store/hooks";
import { Outlet } from "react-router-dom";
import { useIsPresent } from "framer-motion";
import Redirect from "../common/Redirect.tsx";
import type { UserRole } from "../../types/User.ts";

interface Props {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: Props) => {
  const user = useAppSelector((state) => state.auth.user);
  // AnimatePresence keeps the outgoing route mounted while it fades out. On
  // logout that outgoing page re-renders with no user, and redirecting from it
  // would override wherever the logout handler already sent us (e.g. "/").
  const isPresent = useIsPresent();

  if (!user) {
    return isPresent ? <Redirect to="/login" /> : null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/unauthorized" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
