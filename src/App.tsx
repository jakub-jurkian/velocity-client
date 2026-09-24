import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import ProfilePage from "./pages/MyProfilePage/ProfilePage";
import RentBikePage from "./pages/RentBikePage/RentBikePage";
import AboutPage from "./pages/AboutPage/AboutPage";
import PricingPage from "./pages/PricingPage/PricingPage";
import FleetPage from "./pages/FleetPage/FleetPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import ContactPage from "./pages/ContactPage/ContactPage";

import MainLayout from "./components/MainLayout/MainLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import RentalsPage from "./pages/RentalsPage/RentalsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage/UnauthorizedPage";
import Redirect from "./components/common/Redirect";
import { toastConfig } from "./utils/toastConfig";
import { lazy, Suspense, useEffect, useState } from "react";
import { loginSuccess, logout } from "./store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "./store/hooks";
import PageLoader from "./components/common/PageLoader";

// The admin area is split out of the main bundle. Only administrators ever
// reach it, but every visitor was downloading it — including Recharts, which
// is used by exactly one chart page and is the heaviest thing in the tree.

// A single Suspense boundary on the parent route covers the layout and all
// three pages, since a boundary catches any descendant that suspends.
const AdminLayout = lazy(() => import("./pages/Admin/AdminLayout/AdminLayout"));
const PanelPage = lazy(() => import("./pages/Admin/PanelPage/PanelPage"));
const UserManagementPage = lazy(
  () => import("./pages/Admin/UserManagementPage/UserManagementPage"),
);
const BikeManagementPage = lazy(
  () => import("./pages/Admin/BikeManagementPage/BikeManagementPage"),
);

const App = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const jwtToken = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const abortController = new AbortController();

    const verifySession = async () => {
      if (!jwtToken) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        setIsCheckingAuth(true);

        const apiUrl = import.meta.env.VITE_API_URL;

        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Token is invalid/expired -> force logout to clear bad state
            dispatch(logout());
          }
          throw new Error(`Auth check failed with status: ${response.status}`);
        }
        const user = await response.json();
        dispatch(loginSuccess({ user, token: jwtToken }));
      } catch (error: unknown) {
        // Check if the error is a standard JavaScript Error object
        if (error instanceof Error) {
          if (error.name !== "AbortError") {
            console.error("Session verification failed:", error.message);
            toast.error("Network error.");
          }
        }
        // Handle edge cases where a non-Error primitive was thrown
        else {
          console.error("An unexpected error occurred:", error);
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifySession();

    return () => {
      abortController.abort();
    };
  }, [jwtToken, dispatch]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <>
      {!isCheckingAuth && (
        <>
          <ScrollToTop />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={toastConfig}
          />

          {/*
            mode="wait" keeps the deliberate beat between pages: the outgoing
            route fades out before the incoming one fades in.

            That gap used to make the layout jump, because the document briefly
            emptied and the scrollbar vanished with it. The fix lives in CSS now
            rather than here: `scrollbar-gutter: stable` on html reserves the
            gutter permanently, and .mainContent carries a min-height so the
            document cannot collapse while the swap is in flight.
          */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/fleet" element={<FleetPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Public ONLY routes (Login/Register) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected routes (Client & Admin) */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "CLIENT"]}>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/my-rentals" element={<RentalsPage />} />
                </Route>
                <Route path="/rent-bike" element={<RentBikePage />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    {/*
                      One boundary on the parent covers the layout and every
                      page beneath it: a suspending descendant is caught by the
                      nearest Suspense ancestor, and the children render into
                      this layout's Outlet.
                    */}
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Redirect to="panel" />} />

                <Route path="panel" element={<PanelPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="bikes" element={<BikeManagementPage />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export default App;
