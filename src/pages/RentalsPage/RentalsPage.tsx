import { useEffect, useState } from "react";
import { parseISO, format, startOfDay, isBefore } from "date-fns";
import toast from "react-hot-toast";
import { useAppSelector } from "../../store/hooks";
import type { Reservation } from "../../types/Reservation";
import PageTransition from "../../components/common/PageTransition";
import PageLoader from "../../components/common/PageLoader";
import { downloadReservationsCSV } from "../../utils/exportHelper";
import styles from "./RentalsPage.module.scss";

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
  const [isLoading, setIsLoading] = useState(true);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false); // Prevents double-clicks

  // --- Data Fetching ---
  const fetchReservations = async () => {
    try {
      if (!jwtToken) return;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/v1/reservations/my`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      // Success Path
      if (response.ok) {
        const rawData = await response.json();
        setReservations(rawData.data);
        return;
      }

      // Error Path: Safe Parsing for Spring Boot ProblemDetail
      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/problem+json") || 
                     contentType.includes("application/json");

      if (isJson) {
        const problemDetail = await response.json();
        toast.error(problemDetail.detail || "Failed to load reservations.");
        throw new Error(problemDetail.title || "API Error");
      } else {
        throw new Error(`Server error with status: ${response.status}`);
      }

    } catch (error) {
      console.error("Fetch reservations error:", error);
      // Fallback toast if the error wasn't handled by the Spring ProblemDetail block
      if (error instanceof Error && !error.message.includes("API Error")) {
         toast.error("An unexpected error occurred while loading your reservations.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken]);

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
        // Safe parsing for Cancellation errors as well
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/problem+json") || 
                       contentType.includes("application/json");

        if (isJson) {
          const problemDetail = await response.json();
          throw new Error(problemDetail.detail || "Failed to cancel.");
        } else {
          throw new Error("Failed to cancel reservation. It might be too late.");
        }
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

  if (!reservations.length) {
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
            onClick={() => downloadReservationsCSV(reservations)}
          >
            Export CSV
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