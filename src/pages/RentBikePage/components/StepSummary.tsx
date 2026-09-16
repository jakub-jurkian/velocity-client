import { format, parseISO } from "date-fns";
import { WizardStep } from "../../../types/Wizard";
import type { BikeModel } from "../../../types/Fleet";
import type { RentalQuote } from "../../../types/Pricing";
import styles from "../RentBikePage.module.scss";

interface Props {
  setStep: (step: WizardStep) => void;
  chosenBikeModel: BikeModel;
  dates: { start: string; end: string };
  /** Server-priced quote. Every figure below is rendered, never recomputed. */
  quote: RentalQuote;
  onConfirm: () => void;
}

export default function StepSummary({
  setStep,
  chosenBikeModel,
  dates,
  onConfirm,
  quote,
}: Props) {
  const hasDiscount = quote.discountPercentage > 0;

  // Enterprise formatting utilities
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);

  const formatDate = (dateString: string) =>
    format(parseISO(dateString), "MMM d, yyyy"); // e.g., "Oct 12, 2026"

  return (
    <div className={styles.stepContainer}>
      <button
        onClick={() => setStep(WizardStep.BikeSelection)} // Removed magic number
        className={styles.backBtn}
      >
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
            {chosenBikeModel.imageEmoji && (
              <span className={styles.bikeEmoji} aria-hidden="true">
                {chosenBikeModel.imageEmoji}
              </span>
            )}
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
            {formatDate(dates.start)} — {formatDate(dates.end)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{quote.rentalDays} days</span>
        </div>

        <div className={styles.divider}></div>

        {/* --- DETAILED PRICING BREAKDOWN --- */}
        <div className={`${styles.summaryRow} ${styles.alignCenter}`}>
          <span className={styles.label}>Daily Rate</span>

          <div className={styles.rateContainer}>
            {/* Show the undiscounted rate only when a tier actually applied */}
            {hasDiscount && (
              <span className={styles.oldRate}>
                {formatCurrency(quote.baseDailyRate)}
              </span>
            )}

            {/* Final Daily Rate */}
            <span className={styles.value}>
              {formatCurrency(quote.effectiveDailyRate)}
            </span>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className={styles.discountBadge}>
                -{quote.discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Total Calculation Row */}
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span className={styles.label}>Total Price</span>
          <span className={styles.totalValue}>
            {formatCurrency(quote.totalCost)}
          </span>
        </div>
      </div>

      <button className={styles.confirmBtn} onClick={onConfirm}>
        Confirm & Pay
      </button>
    </div>
  );
}
