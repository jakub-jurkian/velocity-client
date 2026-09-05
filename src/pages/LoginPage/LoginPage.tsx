import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../store/hooks";
import { useForm } from "../../hooks/useForm";
import { validateEmail, validateMinLength } from "../../utils/validators";
import PageTransition from "../../components/common/PageTransition";
import styles from "./LoginPage.module.scss";
import { performLogin } from "../../store/slices/authSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const emailError = validateEmail(vals.email);
      if (emailError) errs.email = emailError;

      const passwordError = validateMinLength(vals.password, 6, "Password");
      if (passwordError) errs.password = passwordError;

      return errs;
    },
    onSubmit: async (vals) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const requestData = { email: vals.email, password: vals.password };

        const loginResponse = await fetch(`${apiUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });

        // Handle standard HTTP errors safely
        if (!loginResponse.ok) {
          if (loginResponse.status === 401) {
            const errorData = await loginResponse.json();
            toast.error(errorData.detail || "Unauthorized");
          } else {
            toast.error("Invalid email or password");
          }
          return;
        }

        const data = await loginResponse.json();
        const jwtToken = data.accessToken;

        // fetch user profile
        const userResponse = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details"); // Pushes to the catch block
        }

        const user = await userResponse.json();
        //id, email, fullName, phone, role, city, joinedDate

        // Delegate State & Storage to Redux Thunk
        dispatch(performLogin(user, jwtToken, vals.rememberMe));

        // Success
        toast.success("Logged in successfully!");
        navigate(user.role === "ADMIN" ? "/admin/panel" : "/dashboard", {
          replace: true,
        });
      } catch (error: unknown) {
        // Catch network failures (e.g., server offline, CORS errors)
        console.error("Login Error:", error);
        toast.error("A network error occurred. Please check your connection.");
      }
    },
  });

  return (
    <PageTransition>
      <main className={styles.loginContainer}>
        <div className={styles.glowOrb} aria-hidden="true"></div>

        <section className={styles.loginCard}>
          <header className={styles.header}>
            <div className={styles.logo}>
              Velo<span className={styles.highlight}>City</span>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>
              Enter your credentials to access the fleet.
            </p>
          </header>

          {/* Pass handleSubmit from the hook */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* EMAIL INPUT */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email} // From Hook
                onChange={handleChange} // From Hook
                className={errors.email ? styles.errorInput : ""}
                placeholder="name@velocity.com"
                required
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* PASSWORD INPUT */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={values.password} // From Hook
                onChange={handleChange} // From Hook
                className={errors.password ? styles.errorInput : ""}
                placeholder="••••••••"
                required
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formFooter}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={!!values.rememberMe} // Cast to boolean
                  onChange={handleChange}
                />
                <span className={styles.checkmark}></span>
                Remember me
              </label>
              <a href="#" className={styles.forgotLink}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting} // Controlled by Hook
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Verifying...
                </>
              ) : (
                "Log In ➜"
              )}
            </button>
          </form>

          <footer className={styles.cardFooter}>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </footer>
        </section>
      </main>
    </PageTransition>
  );
};

export default LoginPage;
