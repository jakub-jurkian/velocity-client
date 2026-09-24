import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLogout } from "../../../hooks/useLogout";
import { cx } from "../../../utils/cx";
import BurgerButton from "../../../components/ui/BurgerButton";
import Button from "../../../components/ui/Button";
import Logo from "../../../components/ui/Logo";
import styles from "./AdminLayout.module.scss";

const NAV_LINKS = [
  { to: "/admin/panel", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/bikes", label: "Bikes" },
];

const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const { logout, isLoggingOut } = useLogout(closeMenu);

  return (
    <div className={styles.admin}>
      <nav className={styles.topNav} aria-label="Admin Navigation">
        <div className={styles.brand}>
          <BurgerButton open={isMenuOpen} onToggle={() => setIsMenuOpen((open) => !open)} />
          <Logo suffix="Admin" />
        </div>

        {/* One menu: a row in the bar on desktop, a drawer on phones. */}
        <div className={cx(styles.menu, isMenuOpen && styles.open)}>
          <div className={styles.links}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cx(styles.navItem, isActive && styles.active)}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className={styles.actions}>
            <Button to="/dashboard" variant="outline" size="sm" onClick={closeMenu}>
              Client View
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              busy={isLoggingOut}
              busyText="Logging out"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
