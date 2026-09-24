import { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import { ApiError, apiFetch } from "../../api/client";
import { useForm } from "../../hooks/useForm";
import { changedFields } from "../../utils/changedFields";
import { collectErrors, validateMinLength, validatePhone } from "../../utils/validators";
import { CITY_LABELS, CITY_OPTIONS } from "../../data/cities";
import type { User } from "../../types/User";
import PageTransition from "../../components/common/PageTransition";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Form, ReadOnlyField, SelectField, TextField } from "../../components/ui/Form";
import styles from "./ProfilePage.module.scss";

// What a user may change about themselves. Email is fixed once registered.
const EDITABLE = ["fullName", "phone", "city"] as const;

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, handleSubmit, setErrors, field, reset } = useForm({
    initialValues: { fullName: "", phone: "", city: "" },
    // Mirrors the entity rules the API enforces, so a one-letter name is
    // refused here instead of round-tripping for a 400.
    validate: (values) =>
      collectErrors({
        fullName: validateMinLength(values.fullName, 2, "Full name"),
        phone: validatePhone(values.phone),
      }),
    onSubmit: async (values) => {
      if (!user) return;

      const changes = changedFields(user, { ...user, ...values } as User, EDITABLE);
      if (Object.keys(changes).length === 0) {
        toast("No changes made.", { icon: "ℹ️" });
        setIsEditing(false);
        return;
      }

      try {
        await apiFetch(`/api/v1/users/${user.id}`, { method: "PATCH", body: changes });
        dispatch(updateUser(changes));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } catch (error) {
        console.error("Profile update failed:", error);
        if (!(error instanceof ApiError)) {
          toast.error("Unable to connect to VeloCity server. Please check your connection.");
          return;
        }

        // A 409 is a duplicate phone, which belongs on that input.
        const fieldErrors = error.fieldErrors;
        if (error.status === 409 && error.detail) fieldErrors.phone = error.detail;

        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
        else toast.error(error.detail ?? "Failed to update profile.");
      }
    },
  });

  if (!user) return null;

  // Seeded when editing starts rather than on mount: after a hard refresh
  // /auth/me may not have resolved on the first render, and the form would
  // otherwise open blank.
  const startEditing = () => {
    reset({ fullName: user.fullName, phone: user.phone, city: user.city });
    setIsEditing(true);
  };

  return (
    <PageTransition>
      <div className={styles.profileCard}>
        <aside className={styles.sidebar}>
          <Avatar id={user.id} name={user.fullName} size={120} className={styles.avatar} />
          <h1 className={styles.userName}>{user.fullName}</h1>
          <Badge tone="primary">{user.role}</Badge>
          <p className={styles.userId}>ID: {user.id}</p>
        </aside>

        <section className={styles.details}>
          <div className={styles.sectionHeader}>
            <h2>Account Details</h2>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                Edit Details
              </Button>
            )}
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            {isEditing ? (
              <>
                <TextField id="fullName" label="Full Name" required {...field("fullName")} />
                <TextField id="phone" label="Phone Number" type="tel" required {...field("phone")} />
                <SelectField id="city" label="City" options={CITY_OPTIONS} {...field("city")} />
              </>
            ) : (
              <>
                <ReadOnlyField label="Full Name">{user.fullName}</ReadOnlyField>
                <ReadOnlyField label="Phone Number">{user.phone}</ReadOnlyField>
                <ReadOnlyField label="City">{CITY_LABELS[user.city]}</ReadOnlyField>
              </>
            )}

            <ReadOnlyField label="Email Address">
              {user.email}
              {user.role !== "ADMIN" && (
                <span className={styles.lock} aria-hidden="true">
                  🔒
                </span>
              )}
            </ReadOnlyField>

            {isEditing && (
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  block
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" block busy={isSubmitting} busyText="Saving">
                  Save Changes
                </Button>
              </div>
            )}
          </Form>
        </section>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
