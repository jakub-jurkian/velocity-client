import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import styles from "./BikeManagementPage.module.scss";
import type {
  AdminBike,
  BikeInstanceStatus,
  BikeStatusConflict,
} from "../../../types/Bike";
import { BIKE_STATUSES } from "../../../types/Bike";
import type { PaginationMeta } from "../../../types/Pagination";
import { EMPTY_META } from "../../../types/Pagination";
import { fetchPage, readProblemDetail } from "../../../api/pagination";
import PageTransition from "../../../components/common/PageTransition";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../store/hooks";

const PAGE_SIZE = 10;

const formatStatus = (status: BikeInstanceStatus) =>
  status.charAt(0) + status.slice(1).toLowerCase();

// Maps a status onto the lowercase modifier class defined in the stylesheet.
const statusClassName = (status: BikeInstanceStatus) =>
  styles[status.toLowerCase()] ?? "";

const BikeManagement = () => {
  const [bikes, setBikes] = useState<AdminBike[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BikeInstanceStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<AdminBike | null>(null);
  const [targetStatus, setTargetStatus] = useState<BikeInstanceStatus | "">("");
  const [isSaving, setIsSaving] = useState(false);

  // Populated when the server refuses a status change because live bookings
  // sit on the bike. Holding the list rather than a bare flag lets the second
  // step show the admin exactly whose rides they are about to void.
  const [conflicts, setConflicts] = useState<BikeStatusConflict[] | null>(null);

  const jwtToken = useAppSelector((state) => state.auth.token);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Reads one page, honouring the status filter, and keeps `meta` so the
  // admin can reach every bike rather than only the first pageful.
  const loadBikes = useCallback(async () => {
    if (!jwtToken) return;

    try {
      const result = await fetchPage<AdminBike>(
        "/api/v1/admin/bikes",
        jwtToken,
        { page, size: PAGE_SIZE, params: { status: statusFilter } },
      );
      setBikes(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Failed to fetch bikes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load bikes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, page, statusFilter]);

  useEffect(() => {
    setIsLoading(true);
    loadBikes();
  }, [loadBikes]);

  // Escape closes whichever dialog is on top, but never mid-request: the
  // status change is already in flight at that point and dismissing the
  // confirmation would leave the admin unsure whether it landed.
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSaving) return;
      if (conflicts) {
        setConflicts(null);
      } else {
        setIsModalOpen(false);
        setEditingBike(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, conflicts, isSaving]);

  // Changing the filter must jump back to page 0: staying on, say, page 3
  // while switching filters can land on a page beyond the new, smaller
  // result set and render an empty table that is not actually empty.
  const handleFilterChange = (value: string) => {
    setStatusFilter(value as BikeInstanceStatus | "");
    setPage(0);
  };

  const openStatusModal = (bike: AdminBike) => {
    setEditingBike(bike);
    // Default the picker to a status other than the bike's current one, so
    // "Confirm Change" never opens pre-armed on a same-status no-op.
    setTargetStatus(
      BIKE_STATUSES.find((status) => status !== bike.status) ?? bike.status,
    );
    setIsModalOpen(true);
  };

  const closeStatusModal = () => {
    if (isSaving) return; // Prevent closing mid-request
    setIsModalOpen(false);
    setEditingBike(null);
    setConflicts(null);
  };

  // Steps back from the conflict list to the status picker.
  const dismissConflicts = () => {
    if (isSaving) return;
    setConflicts(null);
  };

  // Sends the status change, optionally forcing it.

  // One function for both steps on purpose. The retry has to carry the same
  // bike, status and version as the attempt that produced the conflict list;
  // a second hand-written fetch is where those drift apart.

  // The version stays valid across the retry because a refusal changes
  // nothing server-side — the 409 is raised before the bike is touched.

  const submitStatusChange = async (force: boolean) => {
    if (!editingBike || !jwtToken || !targetStatus) return;

    const url = new URL(
      `${apiUrl}/api/v1/admin/bikes/${editingBike.id}/status`,
    );
    if (force) url.searchParams.set("force", "true");

    try {
      setIsSaving(true);
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: targetStatus,
          version: editingBike.version,
        }),
      });

      if (!response.ok) {
        // This endpoint returns 409 for two unrelated reasons: a stale
        // `version` (someone else edited the bike) and live bookings standing
        // in the way. They need opposite responses from the UI, so the status
        // code alone is not enough — the presence of a `conflicts` array in
        // the ProblemDetail body is what tells them apart.
        if (response.status === 409) {
          const problem = await response.json().catch(() => null);
          const conflictList = problem?.conflicts as
            | BikeStatusConflict[]
            | undefined;

          if (conflictList?.length) {
            setConflicts(conflictList);
            return;
          }

          // No conflict list: the row's version was stale. Refresh so it picks
          // up the current version and status, rather than leaving a retry
          // that would just fail the same way.
          toast.error(
            problem?.detail ??
              "This bike was just modified by someone else. Refreshing the list...",
          );
          closeStatusModal();
          await loadBikes();
          return;
        }

        // 422 covers an illegal transition (RETIRED is terminal) and, on the
        // force path, a booking that has already started — the server refuses
        // to cancel on or after the start date. Either way its own message is
        // the specific one, so surface it rather than inventing wording.
        toast.error(
          await readProblemDetail(response, "Failed to update bike status."),
        );
        return;
      }

      const cancelled = force ? (conflicts?.length ?? 0) : 0;
      toast.success(
        cancelled > 0
          ? `Bike marked as ${formatStatus(targetStatus)}. ${cancelled} reservation${
              cancelled === 1 ? "" : "s"
            } cancelled.`
          : `Bike marked as ${formatStatus(targetStatus)}.`,
      );
      closeStatusModal();
      // Refetch rather than patch local state: the server increments
      // `version` on every successful transition, so a locally patched row
      // would carry a stale version into the next edit and fail with a
      // spurious 409 on a perfectly valid request.
      await loadBikes();
    } catch (error) {
      console.error(error);
      toast.error("Network connection failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmStatusChange = () => submitStatusChange(false);
  const forceStatusChange = () => submitStatusChange(true);

  return (
    <PageTransition>
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1>Fleet Management</h1>
            <p>View and update the operational status of every bike.</p>
          </div>
        </header>

        <div className={styles.toolbar}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {BIKE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Model</th>
                <th>City</th>
                <th>Status</th>
                <th className={styles.alignRight}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bikes.length === 0 && !isLoading ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={4}>No bikes match this filter.</td>
                </tr>
              ) : (
                bikes.map((bike) => (
                  <tr key={bike.id}>
                    <td data-label="Model">
                      <span className={styles.modelName}>
                        {bike.bikeModelName}
                      </span>
                    </td>
                    <td data-label="City">{bike.city}</td>
                    <td data-label="Status">
                      <span
                        className={`${styles.statusDot} ${statusClassName(bike.status)}`}
                      >
                        {formatStatus(bike.status)}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openStatusModal(bike)}
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Bike pages">
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
                ({meta.totalElements} bikes)
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

        {/* STATUS CHANGE MODAL */}
        {isModalOpen && editingBike && (
          <div className={styles.modalOverlay} onClick={closeStatusModal}>
            <div
              className={styles.modal}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>Change Bike Status</h2>
              <p className={styles.modalSubtitle}>
                {editingBike.bikeModelName} — {editingBike.city}
              </p>

              <div className={styles.formGroup}>
                <label>Current Status</label>
                <div className={styles.valueDisplay}>
                  {formatStatus(editingBike.status)}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="modal-bike-status">New Status</label>
                <select
                  id="modal-bike-status"
                  value={targetStatus}
                  onChange={(e) =>
                    setTargetStatus(e.target.value as BikeInstanceStatus)
                  }
                  disabled={isSaving}
                >
                  {BIKE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={closeStatusModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={confirmStatusChange}
                  disabled={isSaving || targetStatus === editingBike.status}
                >
                  {isSaving ? "Saving…" : "Confirm Change"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/*
          CONFLICT CONFIRMATION - step two.

          Rendered only after the server has refused the change, so the list is
          the server's own answer rather than something the client guessed at.
          Nothing has been written at this point; the bike is untouched until
          the admin confirms.
        */}
        {conflicts && editingBike && (
          <div className={styles.modalOverlay} onClick={dismissConflicts}>
            <div
              className={`${styles.modal} ${styles.dangerModal}`}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="conflict-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="conflict-title">
                {conflicts.length} active reservation
                {conflicts.length === 1 ? "" : "s"} on this bike
              </h2>
              <p className={styles.modalSubtitle}>
                Taking {editingBike.bikeModelName} to{" "}
                {targetStatus && formatStatus(targetStatus)} will cancel the
                bookings below. Riders are not notified automatically.
              </p>

              <ul className={styles.conflictList}>
                {conflicts.map((conflict) => (
                  <li
                    key={conflict.reservationId}
                    className={styles.conflictRow}
                  >
                    <span className={styles.conflictEmail}>
                      {conflict.userEmail}
                    </span>
                    <span className={styles.conflictDates}>
                      {format(parseISO(conflict.startDate), "MMM d")} –{" "}
                      {format(parseISO(conflict.endDate), "MMM d, yyyy")}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={dismissConflicts}
                  disabled={isSaving}
                >
                  Go back
                </button>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={forceStatusChange}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Cancelling…"
                    : `Cancel ${conflicts.length} and continue`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
};

export default BikeManagement;
