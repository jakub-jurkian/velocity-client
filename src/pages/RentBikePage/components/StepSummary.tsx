import {
  getDynamicPrice,
  getRentalDays,
} from "../../../utils/rentalCalculations";
import styles from "../RentBikePage.module.scss";

interface Props {
  setStep: (s: 1 | 2 | 3 | 4 | 5) => void;
  chosenBikeModel: { name: string; imageEmoji: string; category: string };
  dates: { start: string; end: string };
  onClick: () => void;
}

export default function StepSummary({
  setStep,
  chosenBikeModel,
  dates,
  onClick,
}: Props) {
  const RENTAL_DAYS = getRentalDays(dates);
  const PRICE = getDynamicPrice(RENTAL_DAYS);
  return (
    <div className={styles.stepContainer}>
      <button onClick={() => setStep(3)} className={styles.backBtn}>
        ← Back to Bikes
      </button>

      <h1>Confirm Booking</h1>
      <p className={styles.subtitle}>Please review your reservation details.</p>

      <div className={styles.summaryCard}>
        {/* Bike Details */}
        <div className={styles.summaryRow}>
          <span className={styles.label}>Bike Model</span>
          <span className={styles.value}>
            {chosenBikeModel.name}{" "}
            <span style={{ fontSize: "1.2em" }}>
              {chosenBikeModel.imageEmoji}
            </span>
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.label}>Category</span>
          <span className={styles.value}>{chosenBikeModel.category}</span>
        </div>

        <div className={styles.divider}></div>

        {/* Rental Dates */}
        <div className={styles.summaryRow}>
          <span className={styles.label}>Dates</span>
          <span className={styles.value}>
            {dates.start} — {dates.end}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{RENTAL_DAYS} days</span>
        </div>

        <div className={styles.divider}></div>

        {/* --- DETAILED PRICING BREAKDOWN --- */}
        {/* 1. Daily Rate Row with Discount Logic */}
        <div className={styles.summaryRow} style={{ alignItems: "center" }}>
          <span className={styles.label}>Daily Rate</span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Show Old Rate if discount exists */}
            {PRICE.oldRate && (
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                {PRICE.oldRate} PLN
              </span>
            )}

            {/* Final Daily Rate */}
            <span className={styles.value}>{PRICE.dailyRate} PLN</span>

            {/* Discount Badge */}
            {PRICE.discountLabel && (
              <span
                style={{
                  backgroundColor: "#7c3aed", // Purple/Secondary
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                }}
              >
                {PRICE.discountLabel}
              </span>
            )}
          </div>
        </div>

        {/* 2. Total Calculation Row */}
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span className={styles.label}>Total Price</span>
          <span className={styles.totalValue}>{PRICE.total} PLN</span>
        </div>
      </div>

      <button className={styles.confirmBtn} onClick={onClick}>
        Confirm & Pay
      </button>
    </div>
  );
}
