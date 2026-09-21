import { useCallback, useEffect, useState } from "react";
import { parseISO, format, startOfDay, isBefore } from "date-fns";
import toast from "react-hot-toast";
import { useAppSelector } from "../../store/hooks";
import type { Reservation } from "../../types/Reservation";
import type { PaginationMeta } from "../../types/Pagination";
import { EMPTY_META } from "../../types/Pagination";
import { fetchAllPages, fetchPage, readProblemDetail } from "../../api/pagination";
import PageTransition from "../../components/common/PageTransition";
import PageLoader from "../../components/common/PageLoader";
import { downloadReservationsCSV } from "../../utils/exportHelper";
import styles from "./RentalsPage.module.scss";

const PAGE_SIZE = 10;

// Formatter Utilities
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);

const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), "MMM d, yyyy");
};

const RentalsPage = () => {
  const jwtToken = useAppSelector((state) => state.auth.token);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false); // Prevents double-clicks

  // --- Data Fetching ---
  // One page at a time. The API caps a page at 50 rows, so reading `data` and
  // ignoring `meta` used to hide every reservation past the first page.
  const fetchReservations = useCallback(async () => {
    if (!jwtToken) return;

    try {
      const result = await fetchPage<Reservation>(
        "/api/v1/reservations/my",
        jwtToken,
        { page, size: PAGE_SIZE },
      );
      setReservations(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error("Fetch reservations error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while loading your reservations.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, page]);

  useEffect(() => {
    setIsLoading(true);
    fetchReservations();
  }, [fetchReservations]);

  // The CSV is a full export, so it walks every page rather than dumping
  // whichever one happens to be on screen.
  const handleExport = async () => {
    if (!jwtToken) return;

    try {
      setIsExporting(true);
      const all = await fetchAllPages<Reservation>(
        "/api/v1/reservations/my",
        jwtToken,
      );
      downloadReservationsCSV(all);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Could not export your history. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Cancellation Logic ---
  const handleCancelClick = (reservationId: string) => {
    setSelectedResId(reservationId);
    setIsModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedResId) return;

    try {
      setIsCancelling(true);
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(
        `${apiUrl}/api/v1/reservations/${selectedResId}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      if (!response.ok) {
        throw new Error(
          await readProblemDetail(
            response,
            "Failed to cancel reservation. It might be too late.",
          ),
        );
      }

      toast.success("Reservation cancelled successfully!");
      setIsModalOpen(false);
      setSelectedResId(null);
      await fetchReservations(); // Refresh the list seamlessly

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      setIsModalOpen(false); // Close modal on error so they aren't stuck
    } finally {
      setIsCancelling(false);
    }
  };

  const closeModal = () => {
    if (isCancelling) return; // Prevent clicking out while request is in flight
    setIsModalOpen(false);
    setSelectedResId(null);
  };

  // --- Business Logic ---
  const isCancellable = (res: Reservation) => {
    if (res.status !== "CONFIRMED") return false;
    
    // Strict, timezone-safe date comparison
    const tripDate = startOfDay(parseISO(res.startDate));
    const today = startOfDay(new Date());
    
    return isBefore(today, tripDate); 
  };

  // --- Renders ---
  if (isLoading) return <PageLoader />;

  // Judged on the server-side total, not the current page, so an empty page
  // never masquerades as an empty history.
  if (meta.totalElements === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.icon}>📜</div>
        <h2>No history yet</h2>
        <p>You haven't made any reservations.</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={styles.rentalsPage}>
        <header className={styles.header}>
          <h1>Ride History</h1>
          <p>Your past and upcoming journeys.</p>
          <button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Preparing…" : "Export CSV"}
          </button>
        </header>

        <div className={styles.grid}>
          {reservations.map((res) => (
            <article
              key={res.id}
              className={`${styles.card} ${styles[res.status]}`}
            >
              <div className={styles.statusBadge}>
                {res.status.charAt(0) + res.status.slice(1).toLowerCase()}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.row}>
                  <span className={styles.label}>Bike</span>
                  <span className={styles.valueHighlight}>
                    {res.bike.modelName}
                  </span>
                </div>

                <div className={styles.row}>
                  <span className={styles.label}>Dates</span>
                  <span className={styles.value}>
                    {formatDate(res.startDate)} - {formatDate(res.endDate)}
                  </span>
                </div>

                {/*
                  Shown only when someone else ended the booking. A
                  self-cancellation carries no reason, so this cannot fire on
                  a booking the rider cancelled themselves — which is the
                  whole point of the distinction.
                */}
                {res.status === "CANCELLED" && res.cancellationReason && (
                  <div className={styles.cancellationNotice} role="status">
                    <span className={styles.noticeTitle}>
                      Cancelled by VeloCity
                    </span>
                    <p className={styles.noticeBody}>
                      {res.cancellationReason}. You have not been charged for
                      this booking. Contact{" "}
                      <a href="mailto:support@velocity.com">
                        support@velocity.com
                      </a>{" "}
                      if you need help arranging a replacement bike.
                    </p>
                  </div>
                )}

                <div className={`${styles.row} ${styles.idRow}`}>
                  <span className={styles.label}>Reservation ID</span>
                  <span className={styles.mono}>{res.id}</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.totalRow}>
                  <span>Total Paid</span>
                  <span className={styles.price}>
                    {formatCurrency(res.totalCost)}
                  </span>
                </div>
              </div>

              {isCancellable(res) && (
                <div className={styles.cardFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => handleCancelClick(res.id)}
                  >
                    Cancel Reservation
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* --- PAGINATION --- */}
        {meta.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Reservation pages">
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
                ({meta.totalElements} reservations)
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

        {/* --- CONFIRMATION MODAL --- */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <h2 id="modal-title">Cancel Reservation?</h2>
              <p>
                Are you sure you want to cancel this reservation?
                <br />
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={closeModal}
                  disabled={isCancelling}
                >
                  No, Keep it
                </button>
                <button
                  className={styles.dangerBtn}
                  onClick={confirmCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel it"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default RentalsPage;