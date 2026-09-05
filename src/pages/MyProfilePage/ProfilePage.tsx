import { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import PageTransition from "../../components/common/PageTransition";
import { SUPPORTED_CITIES, type City } from "../../types/Fleet";
import styles from "./ProfilePage.module.scss";

interface UserUpdatePayload {
  fullName?: string;
  phone?: string;
  city?: City;
}

const MyProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);

  // Initialized safely from Redux user state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    city: user?.city || SUPPORTED_CITIES[0],
    email: user?.email || "",
  });

  // Check permissions
  const isAdmin = user?.role === "ADMIN";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if any field has actually changed
    const changedPayload: UserUpdatePayload = {};

    if (user.fullName !== formData.fullName) {
      changedPayload.fullName = formData.fullName;
    }
    if (user.phone !== formData.phone) {
      changedPayload.phone = formData.phone;
    }
    if (user.city !== formData.city) {
      changedPayload.city = formData.city;
    }

    if (Object.keys(changedPayload).length === 0) {
      toast("No changes made.", { icon: "ℹ️" });
      setIsEditing(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedPayload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        const isJson =
          contentType.includes("application/problem+json") ||
          contentType.includes("application/json");

        if (isJson) {
          const errorData = await response.json();
          toast.error(errorData.detail || "Failed to update profile.");
        } else {
          toast.error("Server error. Please try again later.");
        }
        return;
      }

      // Update Redux state
      dispatch(updateUser(changedPayload)); 
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Network error during profile update:", error);
      toast.error(
        "Unable to connect to VeloCity server. Please check your connection.",
      );
    }
  };

  const handleCancel = () => {
    // Reset form state back to current user values on cancel
    if (user) {
      setFormData({
        fullName: user.fullName,
        phone: user.phone,
        city: user.city,
        email: user.email,
      });
    }
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className={styles.profilePage}>
        <div className={styles.profileCard}>
          <aside className={styles.profileHeader}>
            <div className={styles.avatarLarge}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <h1 className={styles.userName}>{user.fullName}</h1>
            <span className={styles.roleBadge}>{user.role.toUpperCase()}</span>
            <p className={styles.userId}>ID: {user.id}</p>
          </aside>

          <section className={styles.profileDetails}>
            <div className={styles.sectionHeader}>
              <h2>Account Details</h2>
              {!isEditing && (
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Details
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                {isEditing ? (
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                ) : (
                  <div className={styles.valueDisplay}>{user.fullName}</div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone">Phone Number</label>
                {isEditing ? (
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                ) : (
                  <div className={styles.valueDisplay}>{user.phone}</div>
                )}
              </div>

              {/* City */}
              <div className={styles.inputGroup}>
                <label htmlFor="city">City</label>
                {isEditing ? (
                  <div className={styles.selectControl}>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    >
                      {SUPPORTED_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className={styles.valueDisplay}>{user.city}</div>
                )}
              </div>

              {/* EMAIL read-only */}
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={`${styles.valueDisplay} ${styles.readOnly}`}>
                  {user.email}
                  {!isAdmin && <span className={styles.lockIcon} aria-hidden="true">🔒</span>}
                </div>
              </div>

              {isEditing && (
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default MyProfilePage;