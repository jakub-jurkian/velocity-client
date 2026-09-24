import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../store/hooks";
import { performLogin } from "../../store/slices/authSlice";
import { useForm } from "../../hooks/useForm";
import { collectErrors, validateEmail, validateMinLength } from "../../utils/validators";
import { ApiError, apiFetch } from "../../api/client";
import type { User } from "../../types/User";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import Button from "../../components/ui/Button";
import { CheckboxField, Form, TextField } from "../../components/ui/Form";
import SlowNotice from "../../components/ui/SlowNotice";
import styles from "./LoginPage.module.scss";

// Only a 401 means the credentials were wrong. Everything else is the server
// or the network failing, and saying "invalid email or password" there sends
// the user off resetting a password that was never the problem.
const loginFailureMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return "A network error occurred. Please check your connection.";
  }
  if (error.status === 401) return error.detail ?? "Incorrect email or password.";
  if (error.status >= 500) {
    return "The server is not responding right now. Please try again shortly.";
  }
  return error.detail ?? `Sign-in failed (${error.status}). Please try again.`;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isSubmitting, handleSubmit, field, checkbox } = useForm({
    initialValues: { email: "", password: "", rememberMe: false },
    validate: (values) =>
      collectErrors({
        email: validateEmail(values.email),
        password: validateMinLength(values.password, 8, "Password"),
      }),
    onSubmit: async ({ email, password, rememberMe }) => {
      try {
        const { accessToken } = await apiFetch<{ accessToken: string }>("/api/v1/auth/login", {
          method: "POST",
          body: { email, password },
          token: null,
        });
        const user = await apiFetch<User>("/api/v1/auth/me", { token: accessToken });

        dispatch(performLogin(user, accessToken, rememberMe));
        toast.success("Logged in successfully!");
        navigate(user.role === "ADMIN" ? "/admin/panel" : "/dashboard", { replace: true });
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(loginFailureMessage(error));
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access the fleet."
      footer={
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      }
    >
      <Form onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@velocity.com"
          autoComplete="email"
          required
          {...field("email")}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          {...field("password")}
        />

        <div className={styles.options}>
          <CheckboxField label="Remember me" {...checkbox("rememberMe")} />
          <a href="#" className={styles.forgot}>
            Forgot Password?
          </a>
        </div>

        <Button type="submit" size="lg" block busy={isSubmitting} busyText="Logging in">
          Log In ➜
        </Button>
        {isSubmitting && <SlowNotice />}
      </Form>
    </AuthLayout>
  );
};

export default LoginPage;
