import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import type { Reservation } from "../../types/Reservation";
import PageTransition from "../../components/common/PageTransition";
import PageLoader from "../../components/common/PageLoader";
import styles from "./RentalsPage.module.scss";
import { downloadReservationsCSV } from "../../utils/exportHelper";
import toast from "react-hot-toast";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const RentalsPage = () => {
  const jwtToken = useAppSelector((state) => state.auth.token);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      if (!jwtToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/v1/reservations/my",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      if (response.ok) {
        const rawData = await response.json();
        console.log(rawData.data);

        setReservations(rawData.data);
      }
    } catch (error) {
      console.error("Failed to fetch active rentals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchReservations();
  }, [jwtToken]);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);

  // TRIGGER MODAL
  const handleCancelClick = (reservationId: string) => {
    setSelectedResId(reservationId);
    setIsModalOpen(true);
  };

  // CONFIRM ACTION
  const confirmCancel = async () => {
    if (!selectedResId) return;

    // const success = cancelReservation(selectedResId);
    // send http req for cancel.
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/reservations/${selectedResId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      // const data = await response.json();
      if (!response.ok) {
        setIsModalOpen(false);
        toast.error("Failed to cancel reservation. It might be too late.");
        return;
      }

      setIsModalOpen(false); // Close modal
      setSelectedResId(null);
      toast.success("Reservation cancelled successfully!");
      fetchReservations();
    } catch (error) {
      console.error(error);
    }
  };

  // CLOSE MODAL
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResId(null);
  };

  const isCancellable = (res: Reservation) => {
    if (res.status !== "CONFIRMED") return false;
    const tripDate = new Date(res.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate >= today;
  };

  if (isLoading) {
    return <PageLoader />;
  }

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
          {/* EXPORT BUTTON */}
          {reservations.length > 0 && (
            <button
              className={styles.exportBtn}
              onClick={() => downloadReservationsCSV(reservations)}
            >
              Export CSV
            </button>
          )}
        </header>

        <div className={styles.grid}>
          {reservations.map((res) => (
            <article
              key={res.id}
              className={`${styles.card} ${styles[res.status]}`}
            >
              <div className={styles.statusBadge}>
                {res.status === "PENDING" && "Pending"}
                {res.status === "CONFIRMED" && "Confirmed"}
                {res.status === "CANCELLED" && "Cancelled"}
                {res.status === "COMPLETED" && "Completed"}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.row}>
                  <span className={styles.label}>Bike</span>
                  <span className={styles.valueHighlight}>{res.bike.modelName}</span>
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
                  <span className={styles.price}>{res.totalCost} PLN</span>
                </div>
              </div>

              {/* Show Cancel button only if cancellable */}
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
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
              <h2>Cancel Reservation?</h2>
              <p>
                Are you sure you want to cancel this reservation?
                <br />
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={closeModal}>
                  No, Keep it
                </button>
                <button className={styles.dangerBtn} onClick={confirmCancel}>
                  Yes, Cancel it
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
