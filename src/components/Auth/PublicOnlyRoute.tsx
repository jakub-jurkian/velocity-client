import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import Redirect from "../common/Redirect";

// Log in and register: a signed-in user is sent to their own start page.
const PublicOnlyRoute = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return <Redirect to={user.role === "ADMIN" ? "/admin/panel" : "/dashboard"} />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
