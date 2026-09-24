import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLogout } from "../../../hooks/useLogout";
import { cx } from "../../../utils/cx";
import BurgerButton from "../../../components/ui/BurgerButton";
import Button from "../../../components/ui/Button";
import Logo from "../../../components/ui/Logo";
import SkipLink, { MAIN_CONTENT_ID } from "../../../components/ui/SkipLink";
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
      <SkipLink />
      <nav className={styles.topNav} aria-label="Admin Navigation">
        <div className={styles.brand}>
          <BurgerButton
            open={isMenuOpen}
            onToggle={() => setIsMenuOpen((open) => !open)}
            controls="admin-menu"
          />
          <Logo suffix="Admin" />
        </div>

        {/* One menu: a row in the bar on desktop, a drawer on phones. */}
        <div id="admin-menu" className={cx(styles.menu, isMenuOpen && styles.open)}>
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

      <main id={MAIN_CONTENT_ID} className={styles.content} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
