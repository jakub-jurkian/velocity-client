import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../../components/common/PageTransition";
import styles from "./LoginPage.module.scss";
// import { getUsersFromStorage } from "../../utils/userStorage";
import { useAppDispatch } from "../../store/hooks";
import { loginSuccess } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { useForm } from "../../hooks/useForm";
import { validateEmail, validateMinLength } from "../../utils/validators";

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
      // Fake Delay to show spinner
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const requestData = { email: vals.email, password: vals.password };
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        toast.error("Invalid email or password");
        return;
      }

      const data = await response.json();
      localStorage.setItem("velocity_jwt", data.accessToken);

      const request = await fetch("http://localhost:8080/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });
      const user = await request.json();
      console.log(user);
      //id, email, fullName, phone, role, city, joinedDate

      // browser storage way:
      // const users = getUsersFromStorage();
      // const user = users.find((u) => u.email === vals.email);
      // const isValid = user && user.password === vals.password;

      // Handle "Remember Me"
      // const storage = vals.rememberMe ? localStorage : sessionStorage;
      // storage.setItem("velocity_user", JSON.stringify(user));

      // // Clean up conflicts
      // if (vals.rememberMe) sessionStorage.removeItem("velocity_user");
      // else localStorage.removeItem("velocity_user");

      // Success
      dispatch(loginSuccess(user));
      toast.success("Logged in successfully!");

      navigate(user.role === "ADMIN" ? "/admin/panel" : "/dashboard", {
        replace: true,
      });
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

          {/* ✅ Pass handleSubmit from the hook */}
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
