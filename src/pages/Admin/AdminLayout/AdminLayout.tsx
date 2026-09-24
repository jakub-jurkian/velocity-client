import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../../store/hooks";
import { performLogout } from "../../../store/slices/authSlice";
import BusyLabel from "../../../components/common/BusyLabel";
import styles from "./AdminLayout.module.scss";

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const navLinks = [
    { to: "/admin/panel", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/bikes", label: "Bikes" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // performLogout, not the bare logout action: it also revokes the token
    // server-side and clears it from storage, so a reload stays logged out.
    await dispatch(performLogout());
    setIsMobileOpen(false); // Close drawer on logout
    navigate("/");
    toast.success("Logged out successfully!");
  };

  const handleClientView = () => {
    setIsMobileOpen(false); // Close drawer on navigation
  };

  return (
    <div className={styles.adminContainer}>
      {/* TOP NAVIGATION BAR */}
      <nav className={styles.topNav} aria-label="Admin Navigation">
        
        {/* LEFT: Mobile Toggle + Brand */}
        <div className={styles.brandGroup}>
          <button 
            className={styles.mobileToggle}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
          
          <div className={styles.brand}>
            Velo<span className={styles.highlight}>City</span> Admin
          </div>
        </div>

        {/* CENTER: Desktop Menu */}
        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* RIGHT: User Actions (HIDDEN ON MOBILE via CSS) */}
        <div className={styles.userSection}>
          <Link to="/dashboard" className={styles.switchBtn} title="Go to User View">
            <span>Client View</span>
          </Link>

          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            <BusyLabel busy={isLoggingOut} busyText="Logging out">
              <span>Logout</span>
            </BusyLabel>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`${styles.mobileDrawer} ${isMobileOpen ? styles.open : ""}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            onClick={() => setIsMobileOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        {/* MOBILE ACTIONS */}
        <div className={styles.mobileActions}>
          <Link 
            to="/dashboard" 
            className={styles.mobileSwitch}
            onClick={handleClientView} // Closes drawer when switching views
          >
             Client View
          </Link>
          
          <button
            className={styles.mobileLogout}
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            <BusyLabel busy={isLoggingOut} busyText="Logging out">
              Logout
            </BusyLabel>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;