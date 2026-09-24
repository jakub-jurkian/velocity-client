import { useState } from "react";
import { isBefore, parseISO, startOfDay } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch, toastError } from "../../api/client";
import { fetchAllPages } from "../../api/pagination";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import type { Reservation } from "../../types/Reservation";
import { downloadReservationsCSV } from "../../utils/exportHelper";
import { formatCurrency, formatDate, humanize } from "../../utils/format";
import { cx } from "../../utils/cx";
import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button";
import Callout from "../../components/ui/Callout";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DetailRow, { Divider } from "../../components/ui/DetailRow";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import PageLoader from "../../components/ui/PageLoader";
import Pagination from "../../components/ui/Pagination";
import styles from "./RentalsPage.module.scss";

// Green covers both live-and-good and finished-cleanly; red is the only failed
// outcome, and blue marks a booking still waiting on confirmation.
const STATUS_CLASS: Record<Reservation["status"], string> = {
  CONFIRMED: styles.success,
  COMPLETED: styles.success,
  CANCELLED: styles.danger,
  PENDING: styles.info,
};

// Only a confirmed booking that has not started yet can be cancelled.
const isCancellable = (reservation: Reservation) =>
  reservation.status === "CONFIRMED" &&
  isBefore(startOfDay(new Date()), startOfDay(parseISO(reservation.startDate)));

const RentalsPage = () => {
  const {
    items: reservations,
    meta,
    goToPage,
    isLoading,
    reload,
  } = usePaginatedList<Reservation>("/api/v1/reservations/my", {
    errorText: "An unexpected error occurred while loading your reservations.",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // The CSV is a full export, so it walks every page rather than dumping
  // whichever one happens to be on screen.
  const handleExport = async () => {
    setIsExporting(true);
    try {
      downloadReservationsCSV(await fetchAllPages<Reservation>("/api/v1/reservations/my"));
    } catch (error) {
      console.error("Export failed:", error);
      toastError(error, "Could not export your history. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;

    setIsCancelling(true);
    try {
      await apiFetch(`/api/v1/reservations/${cancellingId}/cancel`, { method: "POST" });
      toast.success("Reservation cancelled successfully!");
      reload();
    } catch (error) {
      console.error(error);
      toastError(error, "Failed to cancel reservation. It might be too late.");
    } finally {
      // Closed on failure too, so the rider is not stuck in the dialog.
      setIsCancelling(false);
      setCancellingId(null);
    }
  };

  // Only the first load replaces the page; later pages keep the current list
  // on screen until the next one arrives.
  if (isLoading && reservations.length === 0) return <PageLoader />;

  // Judged on the server-side total, not the current page, so an empty page
  // never masquerades as an empty history.
  if (meta.totalElements === 0) {
    return (
      <PageTransition>
        <EmptyState
          icon="📜"
          title="No history yet"
          action={<Button to="/rent-bike">Rent a bike</Button>}
        >
          You haven't made any reservations.
        </EmptyState>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageHeader
        title="Ride History"
        subtitle="Your past and upcoming journeys."
        actions={
          <Button
            variant="secondary"
            onClick={handleExport}
            busy={isExporting}
            busyText="Preparing export"
          >
            Export CSV
          </Button>
        }
      />

      <div className={styles.grid}>
        {reservations.map((res) => (
          <article key={res.id} className={cx(styles.card, STATUS_CLASS[res.status])}>
            <div className={styles.statusBadge}>{humanize(res.status)}</div>

            <div className={styles.cardContent}>
              {/*
                Leads the card, directly under the status it explains.
                Shown only when someone else ended the booking: a
                self-cancellation carries no reason.
              */}
              {res.status === "CANCELLED" && res.cancellationReason && (
                <Callout
                  tone="warning"
                  title="Cancelled by VeloCity"
                  role="status"
                  className={styles.notice}
                >
                  <p className={styles.noticeBody}>
                    {res.cancellationReason}. You have not been charged for this booking.
                    Contact <a href="mailto:support@velocity.com">support@velocity.com</a> if
                    you need help arranging a replacement bike.
                  </p>
                </Callout>
              )}

              <DetailRow label="Bike" variant="highlight">
                {res.bike.modelName}
              </DetailRow>
              <DetailRow label="Dates">
                {formatDate(res.startDate)} - {formatDate(res.endDate)}
              </DetailRow>
              <DetailRow label="Reservation ID" variant="mono">
                {res.id}
              </DetailRow>
              <Divider />
              <DetailRow label="Total Paid" variant="total">
                {formatCurrency(res.totalCost)}
              </DetailRow>
            </div>

            {isCancellable(res) && (
              <div className={styles.cardFooter}>
                <Button variant="danger" size="sm" onClick={() => setCancellingId(res.id)}>
                  Cancel Reservation
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      <Pagination
        meta={meta}
        onChange={goToPage}
        disabled={isLoading}
        label="Reservation pages"
        noun="reservations"
      />

      {cancellingId && (
        <ConfirmDialog
          title="Cancel Reservation?"
          message={
            <>
              Are you sure you want to cancel this reservation?
              <br />
              This action cannot be undone.
            </>
          }
          cancelLabel="No, Keep it"
          confirmLabel="Yes, Cancel it"
          onConfirm={confirmCancel}
          onCancel={() => setCancellingId(null)}
          busy={isCancelling}
          busyText="Cancelling"
        />
      )}
    </PageTransition>
  );
};

export default RentalsPage;
