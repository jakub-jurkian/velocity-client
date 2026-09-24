import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import { useLogout } from "../../../hooks/useLogout";
import { cx } from "../../../utils/cx";
import Avatar from "../../ui/Avatar";
import BurgerButton from "../../ui/BurgerButton";
import Button from "../../ui/Button";
import Logo from "../../ui/Logo";
import styles from "./Navbar.module.scss";

export const Navbar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const { logout, isLoggingOut } = useLogout(closeMenu);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cx(styles.topBar, (isScrolled || isMenuOpen) && styles.scrolled)}>
      <Link to="/" className={styles.logoLink} onClick={closeMenu}>
        <Logo />
      </Link>

      <BurgerButton
        open={isMenuOpen}
        onToggle={() => setIsMenuOpen((open) => !open)}
        controls="main-menu"
      />

      <nav
        id="main-menu"
        className={cx(styles.navLinks, isMenuOpen && styles.open)}
        aria-label="Main Navigation"
      >
        {!user ? (
          <>
            <Link to="/about" className={styles.link} onClick={closeMenu}>
              About
            </Link>
            <Link to="/pricing" className={styles.link} onClick={closeMenu}>
              Pricing
            </Link>
            <Button to="/login" variant="outline" size="sm" onClick={closeMenu}>
              Login
            </Button>
          </>
        ) : (
          <>
            {user.role === "ADMIN" && (
              <Link to="/admin" className={styles.link} onClick={closeMenu}>
                Admin Panel
              </Link>
            )}
            <Link to="/dashboard" className={styles.link} onClick={closeMenu}>
              Dashboard
            </Link>

            <div className={styles.userInfo}>
              <span
                className={styles.userName}
                title={user.fullName}
                aria-label={`Signed in as ${user.fullName}`}
              >
                {user.fullName.split(" ")[0]}
              </span>
              <Avatar id={user.id} name={user.fullName} size={42} className={styles.avatar} />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              busy={isLoggingOut}
              busyText="Logging out"
            >
              Log Out
            </Button>
          </>
        )}
      </nav>
    </header>
  );
};
