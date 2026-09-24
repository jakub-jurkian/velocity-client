import type { BikeModel } from "../../../types/Fleet";
import type { RentalQuote } from "../../../types/Pricing";
import { formatCurrency, formatDate } from "../../../utils/format";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DetailRow, { Divider } from "../../../components/ui/DetailRow";
import styles from "../RentBikePage.module.scss";

interface Props {
  bike: BikeModel;
  dates: { start: string; end: string };
  // Server-priced quote. Every figure below is rendered, never recomputed.
  quote: RentalQuote;
  onBack: () => void;
  onConfirm: () => void;
  // True while the booking round trip is in flight.
  isSubmitting: boolean;
}

export default function StepSummary({
  bike,
  dates,
  quote,
  onBack,
  onConfirm,
  isSubmitting,
}: Props) {
  const hasDiscount = quote.discountPercentage > 0;

  return (
    <div className={styles.step}>
      {/* Stepping back mid-request would leave a booking in flight with no
          screen left to report its outcome. */}
      <Button
        variant="ghost"
        size="sm"
        className={styles.back}
        onClick={onBack}
        disabled={isSubmitting}
      >
        ← Back to Bikes
      </Button>

      <h1>Confirm Booking</h1>
      <p className={styles.subtitle}>Please review your reservation details.</p>

      <div className={styles.summaryCard}>
        <DetailRow label="Bike Model">{bike.name}</DetailRow>
        <DetailRow label="Category">{bike.category}</DetailRow>
        <Divider />
        <DetailRow label="Dates">
          {formatDate(dates.start)} — {formatDate(dates.end)}
        </DetailRow>
        <DetailRow label="Duration">{quote.rentalDays} days</DetailRow>
        <Divider />
        <DetailRow label="Daily Rate">
          <span className={styles.rate}>
            {/* The undiscounted rate only when a tier actually applied. */}
            {hasDiscount && (
              <span className={styles.oldRate}>{formatCurrency(quote.baseDailyRate)}</span>
            )}
            {formatCurrency(quote.effectiveDailyRate)}
            {hasDiscount && <Badge tone="primary">-{quote.discountPercentage}%</Badge>}
          </span>
        </DetailRow>
        <Divider />
        <DetailRow label="Total Price" variant="total">
          {formatCurrency(quote.totalCost)}
        </DetailRow>
      </div>

      <Button size="lg" block onClick={onConfirm} busy={isSubmitting} busyText="Booking">
        Confirm Booking
      </Button>
    </div>
  );
}
