import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "../../hooks/useForm";
import {
  collectErrors,
  validateEmail,
  validateMinLength,
  validatePassword,
  validatePhone,
} from "../../utils/validators";
import { ApiError, apiFetch } from "../../api/client";
import { SUPPORTED_CITIES } from "../../types/Fleet";
import { CITY_OPTIONS } from "../../data/cities";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import Button from "../../components/ui/Button";
import { CheckboxField, FieldRow, Form, SelectField, TextField } from "../../components/ui/Form";
import styles from "./RegisterPage.module.scss";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { isSubmitting, handleSubmit, setErrors, field, checkbox } = useForm({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      city: SUPPORTED_CITIES[0] as string,
      agreeOnTerms: false,
    },
    validate: (values) =>
      collectErrors({
        fullName: validateMinLength(values.fullName, 2, "Full Name"),
        phone: validatePhone(values.phone),
        email: validateEmail(values.email),
        password: validatePassword(values.password),
        confirmPassword:
          values.password === values.confirmPassword ? undefined : "Passwords do not match.",
        agreeOnTerms: values.agreeOnTerms
          ? undefined
          : "You must agree to the terms to continue.",
      }),
    onSubmit: async ({ fullName, phone, email, password, city }) => {
      try {
        await apiFetch("/api/v1/auth/register", {
          method: "POST",
          body: { email, password, fullName, city, phone },
          token: null,
        });
        navigate("/login", { replace: true });
        toast.success("You have been registered successfully!");
      } catch (error) {
        if (!(error instanceof ApiError)) {
          console.error("Registration network error:", error);
          toast.error("Unable to connect to VeloCity server. Please check your connection.");
          return;
        }

        // A 400 from @Valid carries per-field messages; a 409 is a duplicate
        // email or phone. Both belong on the input that caused them, not in a
        // toast the user has to map back to a field themselves.
        const fieldErrors = error.fieldErrors;
        if (error.status === 409 && error.detail) {
          fieldErrors[/phone/i.test(error.detail) ? "phone" : "email"] = error.detail;
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else if (error.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(error.detail ?? "Registration failed. Please check your inputs.");
        }
      }
    },
  });

  return (
    <AuthLayout
      wide
      glow="secondary"
      title="Join the Fleet"
      subtitle="Create an account and start riding."
      footer={
        <p>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      }
    >
      <Form onSubmit={handleSubmit} noValidate>
        <FieldRow>
          <TextField
            id="fullName"
            label="Full Name"
            placeholder="Sam Bridges"
            autoComplete="name"
            required
            {...field("fullName")}
          />
          <TextField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+48123456789"
            autoComplete="tel"
            required
            {...field("phone")}
          />
        </FieldRow>

        <TextField
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@velocity.com"
          autoComplete="email"
          required
          {...field("email")}
        />

        <FieldRow>
          <TextField
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            {...field("password")}
          />
          <TextField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            {...field("confirmPassword")}
          />
        </FieldRow>

        <SelectField id="city" label="City" options={CITY_OPTIONS} required {...field("city")} />

        <CheckboxField
          label={
            <>
              I agree to the <span className={styles.fakeLink}>Terms of Service</span> and{" "}
              <span className={styles.fakeLink}>Privacy Policy</span>.
            </>
          }
          {...checkbox("agreeOnTerms")}
        />

        <Button type="submit" size="lg" block busy={isSubmitting} busyText="Creating account">
          Create Account ➜
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default RegisterPage;
