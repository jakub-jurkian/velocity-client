import { useState } from "react";
import toast from "react-hot-toast";
import { ApiError, apiFetch, errorMessage } from "../../../api/client";
import { usePaginatedList } from "../../../hooks/usePaginatedList";
import { findCatalogModel } from "../../../data/fleetCatalog";
import { CITY_LABELS } from "../../../data/cities";
import {
  BIKE_STATUSES,
  type AdminBike,
  type BikeInstanceStatus,
  type BikeStatusConflict,
} from "../../../types/Bike";
import { cx } from "../../../utils/cx";
import { formatDate, humanize } from "../../../utils/format";
import PageTransition from "../../../components/common/PageTransition";
import Badge, { type Tone } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import { ReadOnlyField, SelectField } from "../../../components/ui/Form";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import Pagination from "../../../components/ui/Pagination";
import styles from "./BikeManagementPage.module.scss";

// The endpoint has no default order, and Postgres is free to return rows in a
// different order after an update — so without this a bike could jump to
// another page right after its status changed. Grouping by city then model
// also makes the list scannable; the id is the tiebreaker that makes the order
// fully deterministic.
const SORT = "city,bikeModel.name,id,asc";

// Active is the green used for active users; retired needs no alert colour.
const STATUS_TONE: Record<BikeInstanceStatus, Tone> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  LOST: "danger",
  RETIRED: "neutral",
};

const STATUS_OPTIONS = BIKE_STATUSES.map((status) => ({ value: status, label: humanize(status) }));

// Tail of the UUID: enough to tell two identical-looking bikes apart. The tail
// rather than the head because seeded ids share their leading blocks per batch
// (11111111-1111-4111-8111-000000000001, ...002) and differ only at the end.
const shortId = (id: string) => `#${id.slice(-8)}`;

// Icon and category from the catalogue, with a neutral fallback for new models.
const modelDetails = (modelName: string) => {
  const model = findCatalogModel(modelName);
  return { icon: model?.imageEmoji ?? "🚲", category: model?.category };
};

const BikeId = ({ id }: { id: string }) => (
  <code className={styles.bikeId} title={id}>
    {shortId(id)}
  </code>
);

const BikeManagement = () => {
  const [statusFilter, setStatusFilter] = useState<BikeInstanceStatus | "">("");
  const {
    items: bikes,
    meta,
    setPage,
    goToPage,
    isLoading,
    reload,
  } = usePaginatedList<AdminBike>("/api/v1/admin/bikes", {
    params: { status: statusFilter, sort: SORT },
    errorText: "Failed to load bikes.",
  });

  const [editingBike, setEditingBike] = useState<AdminBike | null>(null);
  const [targetStatus, setTargetStatus] = useState<BikeInstanceStatus>("ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  // Set when the server refuses a status change because live bookings sit on
  // the bike. Holding the list rather than a flag lets the second step show
  // exactly whose rides the admin is about to void.
  const [conflicts, setConflicts] = useState<BikeStatusConflict[] | null>(null);

  // A new filter jumps back to page 0: staying on page 3 of a smaller result
  // set would render an empty table that is not actually empty.
  const handleFilterChange = (value: BikeInstanceStatus | "") => {
    if (value === statusFilter) return;
    setStatusFilter(value);
    setPage(0);
  };

  const openStatusModal = (bike: AdminBike) => {
    setEditingBike(bike);
    // Default the picker to a status other than the current one, so
    // "Confirm Change" never opens pre-armed on a same-status no-op.
    setTargetStatus(BIKE_STATUSES.find((status) => status !== bike.status) ?? bike.status);
  };

  const closeStatusModal = () => {
    if (isSaving) return;
    setEditingBike(null);
    setConflicts(null);
  };

  // Sends the status change, optionally forcing it past live bookings.

  // One function for both steps on purpose: the retry has to carry the same
  // bike, status and version as the attempt that produced the conflict list.
  // The version stays valid across the retry because a refusal changes
  // nothing server-side — the 409 is raised before the bike is touched.
  const submitStatusChange = async (force: boolean) => {
    if (!editingBike) return;

    setIsSaving(true);
    try {
      await apiFetch(`/api/v1/admin/bikes/${editingBike.id}/status`, {
        method: "PATCH",
        query: { force: force ? "true" : undefined },
        body: { status: targetStatus, version: editingBike.version },
      });

      const cancelled = force ? (conflicts?.length ?? 0) : 0;
      toast.success(
        `Bike marked as ${humanize(targetStatus)}.` +
          (cancelled > 0 ? ` ${cancelled} reservation${cancelled === 1 ? "" : "s"} cancelled.` : ""),
      );
      setEditingBike(null);
      setConflicts(null);
      // Refetch rather than patch local state: the server bumps `version` on
      // every transition, so a locally patched row would carry a stale
      // version into the next edit and fail with a spurious 409.
      reload();
    } catch (error) {
      // This endpoint returns 409 for two unrelated reasons: a stale `version`
      // and live bookings in the way. Only the second carries a `conflicts`
      // list, which is what tells them apart.
      if (error instanceof ApiError && error.status === 409) {
        const list = error.problem?.conflicts as BikeStatusConflict[] | undefined;
        if (list?.length) {
          setConflicts(list);
          return;
        }

        // Stale version: refresh so the row picks up the current one, rather
        // than leave a retry that would fail the same way.
        toast.error(
          error.detail ?? "This bike was just modified by someone else. Refreshing the list...",
        );
        setEditingBike(null);
        reload();
        return;
      }

      // 422 covers an illegal transition (RETIRED is terminal) and, when
      // forcing, a booking that has already started. The server's own message
      // is the specific one.
      console.error(error);
      toast.error(errorMessage(error, "Failed to update bike status."));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<AdminBike>[] = [
    {
      header: "Model",
      kind: "primary",
      cell: (bike) => {
        const { icon, category } = modelDetails(bike.bikeModelName);
        return (
          <div className={styles.modelCell}>
            <span className={styles.modelIcon} aria-hidden="true">
              {icon}
            </span>
            <span className={styles.modelText}>
              <span className={styles.modelName}>{bike.bikeModelName}</span>
              <span className={styles.modelMeta}>
                <BikeId id={bike.id} />
                {category && ` · ${category}`}
              </span>
            </span>
          </div>
        );
      },
    },
    { header: "City", cell: (bike) => CITY_LABELS[bike.city] },
    {
      header: "Status",
      cell: (bike) => (
        <Badge tone={STATUS_TONE[bike.status]} fixed>
          {humanize(bike.status)}
        </Badge>
      ),
    },
    {
      header: "Actions",
      kind: "actions",
      cell: (bike) => (
        <Button variant="secondary" size="sm" onClick={() => openStatusModal(bike)}>
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <PageHeader
        size="md"
        title="Fleet Management"
        subtitle="View and update the operational status of every bike."
      />

      <div className={styles.filters} role="group" aria-label="Filter by status">
        {(["", ...BIKE_STATUSES] as const).map((status) => (
          <button
            key={status || "all"}
            type="button"
            className={cx(styles.filterChip, statusFilter === status && styles.selected)}
            aria-pressed={statusFilter === status}
            onClick={() => handleFilterChange(status)}
          >
            {status ? humanize(status) : "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={bikes}
        rowKey={(bike) => bike.id}
        // Retired is terminal, so those rows step back and let the working
        // fleet stand out. The action stays at full strength.
        rowClassName={(bike) => (bike.status === "RETIRED" ? styles.retiredRow : undefined)}
        empty="No bikes match this filter."
        isLoading={isLoading}
      />

      <Pagination meta={meta} onChange={goToPage} disabled={isLoading} label="Bike pages" noun="bikes" />

      {/* Step one: pick the new status. */}
      {editingBike && !conflicts && (
        <Modal
          title="Change Bike Status"
          onClose={closeStatusModal}
          locked={isSaving}
          description={
            <>
              {modelDetails(editingBike.bikeModelName).icon} {editingBike.bikeModelName}{" "}
              <BikeId id={editingBike.id} /> - {CITY_LABELS[editingBike.city]}
            </>
          }
          actions={
            <>
              <Button variant="secondary" onClick={closeStatusModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={() => submitStatusChange(false)}
                disabled={targetStatus === editingBike.status}
                busy={isSaving}
                busyText="Saving"
              >
                Confirm Change
              </Button>
            </>
          }
        >
          <div className={styles.fields}>
            {/* In its pill's colour, so the state being left reads at a glance. */}
            <ReadOnlyField
              label="Current Status"
              className={cx(styles.currentStatus, styles[STATUS_TONE[editingBike.status]])}
            >
              {humanize(editingBike.status)}
            </ReadOnlyField>
            <SelectField
              id="modal-bike-status"
              label="New Status"
              options={STATUS_OPTIONS}
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as BikeInstanceStatus)}
              disabled={isSaving}
            />
          </div>
        </Modal>
      )}

      {/*
        Step two, only after the server refused the change: the list is the
        server's own answer, and nothing has been written yet.
      */}
      {editingBike && conflicts && (
        <ConfirmDialog
          title={`${conflicts.length} active reservation${conflicts.length === 1 ? "" : "s"} on this bike`}
          message={
            <>
              Taking {editingBike.bikeModelName} to {humanize(targetStatus)} will cancel the bookings
              below. Riders are not notified automatically.
            </>
          }
          cancelLabel="Go back"
          confirmLabel={`Cancel ${conflicts.length} and continue`}
          onConfirm={() => submitStatusChange(true)}
          onCancel={() => !isSaving && setConflicts(null)}
          busy={isSaving}
          busyText="Cancelling bookings"
        >
          <ul className={styles.conflictList}>
            {conflicts.map((conflict) => (
              <li key={conflict.reservationId} className={styles.conflictRow}>
                <span className={styles.conflictEmail}>{conflict.userEmail}</span>
                <span className={styles.conflictDates}>
                  {formatDate(conflict.startDate, "MMM d")} – {formatDate(conflict.endDate)}
                </span>
              </li>
            ))}
          </ul>
        </ConfirmDialog>
      )}
    </PageTransition>
  );
};

export default BikeManagement;
