import { useState } from "react";
import styles from "./UserManagementPage.module.scss";
import type { User } from "../../../types/User";
import PageTransition from "../../../components/common/PageTransition";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(() => getUsersFromStorage());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleBlockToggle = (
    userId: string,
    currentStatus: "active" | "blocked"
  ) => {
    const newStatus: "active" | "blocked" =
      currentStatus === "active" ? "blocked" : "active";
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("velocity_users", JSON.stringify(updatedUsers));
    if (newStatus == "active") {
      toast.success("User unblocked successfully!");
    } else {
      toast.success("User blocked successfully!");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = users.map((u) =>
      u.id === editingUser.id ? editingUser : u
    );
    e.preventDefault();
    if (!editingUser) return;

    const originalUser = users.find((u) => u.id === editingUser.id);
    if (!originalUser) return;

    const fieldsToCheck = [
      "fullName",
      "email",
      "phone",
      "role",
      "city",
    ] as const;
    const hasChanged = fieldsToCheck.some(
      (field) => originalUser[field] !== editingUser[field]
    );

    if (!hasChanged) {
      toast("No changes made.", { icon: "ℹ️" });
      return;
    }

    setUsers(updatedUsers);
    localStorage.setItem("velocity_users", JSON.stringify(updatedUsers));
    setIsModalOpen(false);
    setEditingUser(null);
    toast.success("User updated successfully!");
  };

  return (
    <PageTransition>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1>User Management</h1>
            <p>View, edit, and manage system access.</p>
          </div>
        </header>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th className={styles.alignRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.primaryCell}>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {user.fullName.charAt(0)}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.name}>{user.fullName}</span>
                        <span className={styles.email}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">
                    <span
                      className={`${styles.roleTag} ${
                        user.role === "ADMIN" ? styles.admin : styles.client
                      }`}
                    >
                      {user.role === "ADMIN" ? "Administrator" : "Client"}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`${styles.statusDot} ${
                        user.status === "ACTIVE"
                          ? styles.active
                          : styles.blocked
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td data-label="Joined">
                    <span className={styles.dateText}>
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </span>
                  </td>

                  <td className={styles.actionsCell}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>

                    <button
                      className={`${styles.actionBtn} ${
                        user.status === "ACTIVE"
                          ? styles.danger
                          : styles.success
                      }`}
                      onClick={() => handleBlockToggle(user.id!, user.status)}
                    >
                      {user.status === "ACTIVE" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && editingUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Edit User</h2>
              <form onSubmit={handleSaveUser}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editingUser.phone}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+48..."
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value as "ADMIN" | "CLIENT",
                        })
                      }
                    >
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>City</label>
                    <select
                      value={editingUser.city}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          city: e.target.value as
                            | "WARSAW"
                            | "GDANSK"
                            | "POZNAN"
                            | "WROCLAW",
                        })
                      }
                    >
                      <option value="WARSAW">Warsaw</option>
                      <option value="GDANSK">Gdansk</option>
                      <option value="POZNAN">Poznan</option>
                      <option value="WROCLAW">Wroclaw</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default UserManagement;
