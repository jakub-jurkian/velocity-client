import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../store/hooks";
import { ApiError, apiFetch, errorMessage } from "../../../api/client";
import { usePaginatedList } from "../../../hooks/usePaginatedList";
import { CITY_OPTIONS } from "../../../data/cities";
import { SUPPORTED_ROLES, type AdminUser, type UserRole } from "../../../types/User";
import { changedFields } from "../../../utils/changedFields";
import { cx } from "../../../utils/cx";
import { formatDate, humanize } from "../../../utils/format";
import PageTransition from "../../../components/common/PageTransition";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import { FieldRow, Form, ReadOnlyField, SelectField, TextField } from "../../../components/ui/Form";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import Pagination from "../../../components/ui/Pagination";
import styles from "./UserManagementPage.module.scss";

const ROLE_LABELS: Record<UserRole, string> = { ADMIN: "Administrator", CLIENT: "Client" };
const ROLE_OPTIONS = SUPPORTED_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

// Fields the admin profile PATCH accepts. The role has its own endpoint.
const PROFILE_FIELDS = ["fullName", "email", "phone", "city"] as const;

const UserManagement = () => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const {
    items: users,
    setItems: setUsers,
    meta,
    goToPage,
    isLoading,
    reload,
  } = usePaginatedList<AdminUser>("/api/v1/admin/users", { errorText: "Failed to load users." });

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const replaceUser = (updated: AdminUser) =>
    setUsers((list) => list.map((user) => (user.id === updated.id ? updated : user)));

  // Binds an edit-modal input to one field of the user being edited.
  const edit =
    (key: keyof AdminUser) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setEditingUser((user) => user && ({ ...user, [key]: event.target.value } as AdminUser));

  const requestToggle = (user: AdminUser) => {
    if (user.id === currentUserId) {
      toast.error("You cannot block your own admin account.");
      return;
    }
    setUserToToggle(user);
  };

  const blocking = userToToggle?.status === "ACTIVE";

  const confirmToggle = async () => {
    if (!userToToggle) return;

    setIsSaving(true);
    try {
      await apiFetch(`/api/v1/admin/users/${userToToggle.id}/${blocking ? "block" : "unblock"}`, {
        method: "POST",
      });
      replaceUser({ ...userToToggle, status: blocking ? "BLOCKED" : "ACTIVE" });
      toast.success(blocking ? "User blocked successfully!" : "User unblocked successfully!");
      setUserToToggle(null);
    } catch (error) {
      console.error(error);
      toast.error(
        errorMessage(error, blocking ? "Failed to block user." : "Failed to unblock user."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    const original = users.find((user) => user.id === editingUser?.id);
    if (!editingUser || !original) return;

    // Only genuinely changed fields are sent, so an untouched one is left
    // alone server-side rather than rewritten.
    const profileChanges = changedFields(original, editingUser, PROFILE_FIELDS);
    const hasProfileChanges = Object.keys(profileChanges).length > 0;
    const roleChanged = original.role !== editingUser.role;

    if (!hasProfileChanges && !roleChanged) {
      toast("No changes made.", { icon: "ℹ️" });
      setEditingUser(null);
      return;
    }

    setIsSaving(true);
    try {
      if (hasProfileChanges) {
        await apiFetch(`/api/v1/admin/users/${original.id}`, {
          method: "PATCH",
          body: profileChanges,
        });
      }

      if (roleChanged) {
        try {
          await apiFetch(`/api/v1/admin/users/${original.id}/role`, {
            method: "PATCH",
            body: { role: editingUser.role },
          });
        } catch (error) {
          // The profile PATCH may already have succeeded, so pull the
          // server's version rather than leave a half-applied edit on screen.
          if (error instanceof ApiError) reload();
          throw error;
        }
      }

      replaceUser(editingUser);
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(errorMessage(error, "Failed to update the user."));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      header: "User",
      kind: "primary",
      cell: (user) => (
        <div className={styles.userCell}>
          <Avatar id={user.id} name={user.fullName} size={36} />
          <div className={styles.userInfo}>
            <span className={styles.name}>{user.fullName}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <Badge tone={user.role === "ADMIN" ? "primary" : "neutral"} fixed>
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (user) => (
        <span className={cx(styles.status, user.status === "ACTIVE" ? styles.active : styles.blocked)}>
          {humanize(user.status)}
        </span>
      ),
    },
    { header: "Joined", cell: (user) => formatDate(user.createdAt) },
    {
      header: "Actions",
      kind: "actions",
      cell: (user) => (
        <>
          <Button variant="secondary" size="sm" onClick={() => setEditingUser({ ...user })}>
            Edit
          </Button>
          <Button
            variant={user.status === "ACTIVE" ? "danger" : "success"}
            size="sm"
            className={styles.toggle}
            onClick={() => requestToggle(user)}
          >
            {/*
              Both labels share one grid cell, so the button is as wide as
              "Unblock" on every row and the Edit buttons line up in a column.
            */}
            <span className={cx(user.status !== "ACTIVE" && styles.hidden)}>Block</span>
            <span className={cx(user.status === "ACTIVE" && styles.hidden)}>Unblock</span>
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader size="md" title="User Management" subtitle="View, edit, and manage system access." />

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        empty="No users found."
        isLoading={isLoading}
        minWidth={900}
      />

      <Pagination meta={meta} onChange={goToPage} disabled={isLoading} label="User pages" noun="users" />

      {editingUser && (
        <Modal
          title="Edit User"
          size="md"
          // Cyan edge while the user holds (or is being given) the admin role.
          tone={editingUser.role === "ADMIN" ? "primary" : undefined}
          onClose={() => setEditingUser(null)}
          locked={isSaving}
          actions={
            <>
              <Button variant="secondary" onClick={() => setEditingUser(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" form="edit-user" busy={isSaving} busyText="Saving">
                Save Changes
              </Button>
            </>
          }
        >
          <Form id="edit-user" onSubmit={saveUser}>
            <TextField
              id="modal-fullName"
              label="Full Name"
              value={editingUser.fullName}
              onChange={edit("fullName")}
              required
            />
            <FieldRow>
              <TextField
                id="modal-email"
                label="Email"
                type="email"
                value={editingUser.email}
                onChange={edit("email")}
                required
              />
              <TextField
                id="modal-phone"
                label="Phone Number"
                type="tel"
                placeholder="+48..."
                value={editingUser.phone}
                onChange={edit("phone")}
              />
            </FieldRow>
            <FieldRow>
              {/* An admin cannot demote themselves out of the panel. */}
              {editingUser.id === currentUserId ? (
                <ReadOnlyField label="Role">
                  {ROLE_LABELS[editingUser.role]}
                  <span aria-hidden="true">🔒</span>
                </ReadOnlyField>
              ) : (
                <SelectField
                  id="modal-role"
                  label="Role"
                  options={ROLE_OPTIONS}
                  value={editingUser.role}
                  onChange={edit("role")}
                />
              )}
              <SelectField
                id="modal-city"
                label="City"
                options={CITY_OPTIONS}
                value={editingUser.city}
                onChange={edit("city")}
              />
            </FieldRow>
          </Form>
        </Modal>
      )}

      {userToToggle && (
        <ConfirmDialog
          title={blocking ? "Block User?" : "Unblock User?"}
          message={
            <>
              Are you sure you want to {blocking ? "block" : "unblock"} {userToToggle.fullName}?
              <br />
              This action will change their system access.
            </>
          }
          cancelLabel="No, Keep it"
          confirmLabel={blocking ? "Yes, Block" : "Yes, Unblock"}
          tone={blocking ? "danger" : "primary"}
          onConfirm={confirmToggle}
          onCancel={() => setUserToToggle(null)}
          busy={isSaving}
          busyText={blocking ? "Blocking" : "Unblocking"}
        />
      )}
    </PageTransition>
  );
};

export default UserManagement;
