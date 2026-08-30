import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logout } from "../../../store/slices/authSlice";
import styles from "./Navbar.module.scss";
import toast from "react-hot-toast";

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === "ADMIN";

  // 1. State for Mobile Menu & Scroll
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = !!user;

  // 2. Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      // Change style if scrolled more than 20px
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandle = () => {
    setIsMenuOpen(false);
    navigate("/");
    dispatch(logout());
    toast.success("Logged out successfully!");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    // 3. Dynamic Class: We add .scrolled if user scrolls OR if menu is open
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
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Navigation Links */}
      <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ""}`}>
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
              <Link to="/admin" className={styles.adminBadge}>
                Admin Panel
              </Link>
            )}
            <Link to="/dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName}</span>
              <div className={styles.avatar}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button onClick={logoutHandle} className={styles.loginBtn}>
              Log Out
            </button>
          </>
        )}
      </div>
    </header>
  );
};
