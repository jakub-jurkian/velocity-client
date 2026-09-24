import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../store/hooks";
import { performLogout } from "../store/slices/authSlice";

// Logs out through performLogout, which also revokes the token server-side and
// clears it from storage, so a reload stays logged out. `isLoggingOut` drives
// the button's spinner while that round trip runs.
export const useLogout = (onLoggedOut?: () => void) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    await dispatch(performLogout());
    setIsLoggingOut(false);
    onLoggedOut?.();
    navigate("/");
    toast.success("Logged out successfully!");
  };

  return { logout, isLoggingOut };
};
