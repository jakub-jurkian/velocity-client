import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { performLogout } from "../../../store/slices/authSlice";
import styles from "./Navbar.module.scss";

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!user;

  // State for Mobile Menu & Scroll
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimized Scroll Listener with { passive: true }
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandle = () => {
    setIsMenuOpen(false);
    navigate("/");
    dispatch(performLogout());
    toast.success("Logged out successfully!");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`${styles.topBar} ${
        isScrolled || isMenuOpen ? styles.scrolled : ""
      }`}
    >
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        Velo<span className={styles.highlight}>City</span>
      </Link>

      {/* Hamburger Icon */}
      <button
        className={`${styles.burger} ${isMenuOpen ? styles.active : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav 
        className={`${styles.navLinks} ${isMenuOpen ? styles.open : ""}`}
        aria-label="Main Navigation"
      >
        {!isAuthenticated ? (
          <>
            <Link to="/about" onClick={closeMenu}>
              About
            </Link>
            <Link to="/pricing" onClick={closeMenu}>
              Pricing
            </Link>
            <Link to="/login" className={styles.loginBtn} onClick={closeMenu}>
              Login
            </Link>
          </>
        ) : (
          <>
            {isAdmin && (
              <Link to="/admin" className={styles.adminBadge} onClick={closeMenu}>
                Admin Panel
              </Link>
            )}
            {/* Added closeMenu here so mobile drawer closes on navigation */}
            <Link to="/dashboard" onClick={closeMenu}>
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
              <div className={styles.avatar} aria-hidden="true">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>

            <button onClick={logoutHandle} className={styles.loginBtn}>
              Log Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
};