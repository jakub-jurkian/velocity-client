import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";

import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import PricingPage from "./pages/PricingPage/PricingPage";
import FleetPage from "./pages/FleetPage/FleetPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import UnauthorizedPage from "./pages/UnauthorizedPage/UnauthorizedPage";

import MainLayout from "./components/MainLayout/MainLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicOnlyRoute from "./components/Auth/PublicOnlyRoute";
import ScrollToTop from "./components/common/ScrollToTop";
import Redirect from "./components/common/Redirect";
import PageLoader from "./components/ui/PageLoader";
import { ApiError, apiFetch, SessionExpiredError } from "./api/client";
import { toastConfig } from "./utils/toastConfig";
import { clearSession, loginSuccess } from "./store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import type { User } from "./types/User";

// Everything behind a login is split out of the main bundle, so a visitor
// reading the public pages downloads none of it. The account pages suspend
// inside MainLayout's boundary, keeping the navbar on screen while they load.
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/MyProfilePage/ProfilePage"));
const RentalsPage = lazy(() => import("./pages/RentalsPage/RentalsPage"));
const RentBikePage = lazy(() => import("./pages/RentBikePage/RentBikePage"));

// The admin area, including Recharts (the heaviest thing in the tree, used by
// one chart page), has its own chunks. A single Suspense boundary on the
// parent route covers the layout and all three pages.
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
  const dispatch = useAppDispatch();
  const jwtToken = useAppSelector((state) => state.auth.token);

  // A stored token only restores the session once /auth/me has answered for
  // it, so the app waits on the check for whichever token it holds now.
  const [checkedToken, setCheckedToken] = useState<string | null>(null);
  const isCheckingAuth = jwtToken !== null && checkedToken !== jwtToken;

  useEffect(() => {
    if (!jwtToken) return;
    const controller = new AbortController();

    apiFetch<User>("/api/v1/auth/me", { token: jwtToken, signal: controller.signal })
      .then((user) => dispatch(loginSuccess({ user, token: jwtToken })))
      .catch((error) => {
        // An expired token (401) is cleared and reported by apiFetch itself.
        if (controller.signal.aborted || error instanceof SessionExpiredError) return;
        // A token the server refuses outright, e.g. a blocked account's: drop
        // it from storage too, or every reload would try it again.
        if (error instanceof ApiError && error.status === 403) {
          dispatch(clearSession());
          return;
        }
        console.error("Session verification failed:", error);
        toast.error("Network error.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCheckedToken(jwtToken);
      });

    return () => controller.abort();
  }, [jwtToken, dispatch]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={toastConfig} />

      {/*
        mode="wait" keeps the deliberate beat between pages: the outgoing
        route fades out before the incoming one fades in.

        That gap used to make the layout jump, because the document briefly
        emptied and the scrollbar vanished with it. The fix lives in CSS now
        rather than here: `scrollbar-gutter: stable` on html reserves the
        gutter permanently, and the main content carries a min-height so the
        document cannot collapse while the swap is in flight.

        LazyMotion supplies only the DOM animation features to the `m`
        components, instead of every page shipping the full motion bundle.
        strict turns any stray `motion.*` into an error, so it cannot creep
        back in.
      */}
      <LazyMotion features={domAnimation} strict>
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

            {/* Any signed-in user */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-rentals" element={<RentalsPage />} />
              </Route>
              <Route
                path="/rent-bike"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RentBikePage />
                  </Suspense>
                }
              />
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
      </LazyMotion>
    </>
  );
};

export default App;
