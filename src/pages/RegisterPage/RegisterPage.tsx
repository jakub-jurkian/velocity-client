import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import {
  validateEmail,
  validateMinLength,
  validatePhone,
} from "../../utils/validators";
import PageTransition from "../../components/common/PageTransition";
import { SUPPORTED_CITIES } from "../../types/Fleet"; // 1. Use the central source of truth
import styles from "./RegisterPage.module.scss";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeOnTerms: false,
      city: SUPPORTED_CITIES[0], // Default to the first supported city safely
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      
      const fullNameError = validateMinLength(vals.fullName, 2, "Full Name");
      if (fullNameError) errs.fullName = fullNameError;

      const phoneError = validatePhone(vals.phone);
      if (phoneError) errs.phone = phoneError;

      const emailError = validateEmail(vals.email);
      if (emailError) errs.email = emailError;

      const passwordError = validateMinLength(vals.password, 8, "Password");
      if (passwordError) errs.password = passwordError;

      if (vals.password !== vals.confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }

      if (!vals.agreeOnTerms) {
        errs.agreeOnTerms = "You must agree to the terms to continue.";
      }

      return errs;
    },
    onSubmit: async (vals) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL; // 2. No hardcoded localhost

        const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: vals.email,
            password: vals.password,
            fullName: vals.fullName,
            city: vals.city,
            phone: vals.phone,
          }),
        });

        if (!response.ok) {
          // 3. Safe JSON parsing to protect against HTML server crashes
          const contentType = response.headers.get("content-type") || "";
          const isJson = contentType.includes("application/problem+json") || 
                         contentType.includes("application/json");

          if (isJson) {
            const errorData = await response.json();
            toast.error(errorData.detail || "Registration failed. Please check your inputs.");
          } else {
            toast.error("Server error. Please try again later.");
          }
          return;
        }

        navigate("/login", { replace: true });
        toast.success("You have been registered successfully!");
        
      } catch (error) {
        console.error("Registration network error:", error);
        toast.error("Unable to connect to VeloCity server. Please check your connection.");
      }
    },
  });

  return (
    <PageTransition>
      <main className={styles.registerContainer}>
        <div className={styles.glowOrb} aria-hidden="true"></div>

        <section
          className={styles.registerCard}
          aria-labelledby="register-title"
        >
          <header className={styles.header}>
            <div className={styles.logo}>
              Velo<span className={styles.highlight}>City</span>
            </div>
            <h1 id="register-title" className={styles.title}>
              Join the Fleet
            </h1>
            <p className={styles.subtitle}>
              Create your courier account and start earning today.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Name & Phone Grid */}
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Sam Bridges"
                  autoComplete="name"
                  required
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <span className={styles.errorText}>{errors.fullName}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+48 000 000 000"
                  autoComplete="tel"
                  required
                  onChange={handleChange}
                />
                {errors.phone && (
                  <span className={styles.errorText}>{errors.phone}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@velocity.com"
                autoComplete="email"
                required
                onChange={handleChange}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Passwords Grid */}
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* City Selection */}
            <div className={styles.inputGroup}>
              <label htmlFor="city">City</label>
              <div className={styles.selectControl}>
                <select
                  id="city"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  required
                >
                  {/* Iterate over the central source of truth */}
                  {SUPPORTED_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className={styles.termsGroup}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  required
                  name="agreeOnTerms"
                  checked={!!values.agreeOnTerms}
                  onChange={handleChange}
                />
                <span className={styles.checkmark}></span>
                <span className={styles.termsText}>
                  {/* 4. Removed href="#" to prevent page jumping. Use spans or real <Link>s */}
                  I agree to the <span className={styles.fakeLink}>Terms of Service</span> and{" "}
                  <span className={styles.fakeLink}>Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeOnTerms && (
                <span className={styles.errorText}>
                  {String(errors.agreeOnTerms)}
                </span>
              )}
            </div>

            {/* Submit Button with Spinner */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account ➜"
              )}
            </button>
          </form>

          <footer className={styles.cardFooter}>
            <p>
              Already have an account? <Link to="/login">Log in here</Link>
            </p>
          </footer>
        </section>
      </main>
    </PageTransition>
  );
};

export default RegisterPage;