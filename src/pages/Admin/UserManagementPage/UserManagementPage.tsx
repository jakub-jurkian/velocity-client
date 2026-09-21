import { useCallback, useEffect, useState } from "react";
import styles from "./UserManagementPage.module.scss";
import type { AdminUser } from "../../../types/User";
import type { PaginationMeta } from "../../../types/Pagination";
import { EMPTY_META } from "../../../types/Pagination";
import { fetchPage, readProblemDetail } from "../../../api/pagination";
import PageTransition from "../../../components/common/PageTransition";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../store/hooks";
import { SUPPORTED_CITIES, type City } from "../../../types/Fleet";

const PAGE_SIZE = 10;

/**
 * Fields the admin PATCH endpoint accepts. Every key is optional because the
 * request is a partial update: only genuinely changed fields are sent, so an
 * untouched field is left alone server-side rather than rewritten.
 */
interface UserUpdatePayloadByAdmin {
  fullName?: string;
  phone?: string;
  email?: string;
  city?: City;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<AdminUser | null>(null);

  const jwtToken = useAppSelector((state) => state.auth.token);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Reads one page and keeps `meta`, so the admin can reach every account
  // rather than only the first pageful.
  const loadUsers = useCallback(async () => {
    if (!jwtToken) return;

    try {
      const result = await fetchPage<AdminUser>(
        "/api/v1/admin/users",
        jwtToken,
        { page, size: PAGE_SIZE },
      );
      setUsers(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load users.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, page]);

  useEffect(() => {
    setIsLoading(true);
    loadUsers();
  }, [loadUsers]);

  const handleBlockClick = (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot block your own admin account.");
      return;
    }

    const user = users.find((candidate) => candidate.id === userId);
    if (!user) return;

    setUserToBlock(user);
    setIsBlockModalOpen(true);
  };

  const confirmBlockToggle = async () => {
    if (!userToBlock || !jwtToken) return;

    const { id: userId, status: currentStatus } = userToBlock;
    const statusUrl = currentStatus === "ACTIVE" ? "block" : "unblock";

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/admin/users/${userId}/${statusUrl}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (!response.ok) {
        toast.error(
          currentStatus === "ACTIVE"
            ? "Failed to block user."
            : "Failed to unblock user.",
        );
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to update user status.");
      return;
    }

    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const updatedUsers: AdminUser[] = users.map((u) =>
      u.id === userId ? { ...u, status: newStatus } : u,
    );

    setUsers(updatedUsers);

    if (newStatus === "ACTIVE") {
      toast.success("User unblocked successfully!");
    } else {
      toast.success("User blocked successfully!");
    }

    setIsBlockModalOpen(false);
    setUserToBlock(null);
  };

  const closeBlockModal = () => {
    setIsBlockModalOpen(false);
    setUserToBlock(null);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !jwtToken) return;

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
      (field) => originalUser[field] !== editingUser[field],
    );

    if (!hasChanged) {
      toast("No changes made.", { icon: "ℹ️" });
      setIsModalOpen(false);
      return;
    }

    const changedPayload: UserUpdatePayloadByAdmin = {};

    if (originalUser.fullName !== editingUser.fullName) {
      changedPayload.fullName = editingUser.fullName;
    }
    if (originalUser.phone !== editingUser.phone) {
      changedPayload.phone = editingUser.phone;
    }
    if (originalUser.city !== editingUser.city) {
      changedPayload.city = editingUser.city;
    }
    if (originalUser.email !== editingUser.email) {
      changedPayload.email = editingUser.email;
    }

    // First API Call: Profile Update
    if (Object.keys(changedPayload).length !== 0) {
      try {
        const response = await fetch(
          `${apiUrl}/api/v1/admin/users/${originalUser.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changedPayload),
          },
        );

        if (!response.ok) {
          toast.error(
            await readProblemDetail(response, "Failed to update profile."),
          );
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Network connection failed.");
        return;
      }
    }

    // Second API Call: Role Update
    if (originalUser.role !== editingUser.role) {
      try {
        const responseRole = await fetch(
          `${apiUrl}/api/v1/admin/users/${originalUser.id}/role`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: editingUser.role }),
          },
        );

        if (!responseRole.ok) {
          toast.error(
            await readProblemDetail(responseRole, "Failed to update role."),
          );

          // The profile PATCH may already have succeeded, so pull the server's
          // version rather than leaving a half-applied edit on screen.
          await loadUsers();
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Network connection failed.");
        return;
      }
    }

    const updatedUsers = users.map((u) =>
      u.id === editingUser.id ? editingUser : u,
    );
    setUsers(updatedUsers);
    setIsModalOpen(false);
    setEditingUser(null);
    toast.success("User updated successfully!");
  };

  return (
    <PageTransition>
      <main className={styles.container}>
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
                      <div className={styles.avatar} aria-hidden="true">
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
                      {new Date(user.createdAt).toLocaleDateString()}
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
                      onClick={() => handleBlockClick(user.id!)}
                    >
                      {user.status === "ACTIVE" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="User pages">
            <button
              className={styles.pageBtn}
              onClick={() => setPage((current) => current - 1)}
              disabled={!meta.hasPrevious || isLoading}
            >
              ← Previous
            </button>

            <span className={styles.pageInfo} aria-live="polite">
              Page {meta.currentPage + 1} of {meta.totalPages}
              <span className={styles.pageTotal}>
                {" "}
                ({meta.totalElements} users)
              </span>
            </span>

            <button
              className={styles.pageBtn}
              onClick={() => setPage((current) => current + 1)}
              disabled={!meta.hasNext || isLoading}
            >
              Next →
            </button>
          </nav>
        )}

        {/* EDIT MODAL */}
        {isModalOpen && editingUser && (
          <div
            className={styles.modalOverlay}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className={styles.modal}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>Edit User</h2>
              <form onSubmit={handleSaveUser}>
                <div className={styles.formGroup}>
                  <label htmlFor="modal-fullName">Full Name</label>
                  <input
                    id="modal-fullName"
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
                    <label htmlFor="modal-email">Email</label>
                    <input
                      id="modal-email"
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
                    <label htmlFor="modal-phone">Phone Number</label>
                    <input
                      id="modal-phone"
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
                    <label htmlFor="modal-role">Role</label>
                    {editingUser.id === currentUserId ? (
                      <div
                        className={styles.readOnly}
                      >
                        {editingUser.role === "ADMIN"
                          ? "Administrator"
                          : "Client"}
                        <span className={styles.lockIcon} aria-hidden="true">
                          🔒
                        </span>
                      </div>
                    ) : (
                      <select
                        id="modal-role"
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
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="modal-city">City</label>
                    <select
                      id="modal-city"
                      value={editingUser.city}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          city: e.target.value as City,
                        })
                      }
                    >
                      {SUPPORTED_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city.charAt(0) + city.slice(1).toLowerCase()}
                        </option>
                      ))}
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

        {/* BLOCK / UNBLOCK MODAL */}
        {isBlockModalOpen && userToBlock && (
          <div className={styles.modalOverlay} onClick={closeBlockModal}>
            <div
              className={styles.modal}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>
                {userToBlock.status === "ACTIVE"
                  ? "Block User?"
                  : "Unblock User?"}
              </h2>
              <p>
                Are you sure you want to{" "}
                {userToBlock.status === "ACTIVE" ? "block" : "unblock"}{" "}
                {userToBlock.fullName}?
                <br />
                This action will change their system access.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={closeBlockModal}
                >
                  No, Keep it
                </button>
                <button
                  className={
                    userToBlock.status === "ACTIVE"
                      ? styles.dangerBtn
                      : styles.primaryBtn
                  }
                  onClick={confirmBlockToggle}
                >
                  {userToBlock.status === "ACTIVE"
                    ? "Yes, Block"
                    : "Yes, Unblock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
};

export default UserManagement;
