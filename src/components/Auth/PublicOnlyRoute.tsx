import { useAppSelector } from "../../store/hooks";
import { Outlet } from "react-router-dom";
import Redirect from "../common/Redirect.tsx";

interface Props {
  children?: React.ReactNode;
}

const PublicOnlyRoute = ({ children }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return (
      <Redirect to={user.role === "ADMIN" ? "/admin/panel" : "/dashboard"} />
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicOnlyRoute;