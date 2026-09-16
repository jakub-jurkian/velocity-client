/**
 * Mirrors the backend `RentalQuote` record (com.velocity.api.pricing.dto).
 *
 * Money is computed and tiered exclusively by `RentalCostCalculator` on the
 * server. The client renders these values and never derives its own total —
 * any client-side arithmetic would drift from the persisted `totalCost`.
 *
 * `rentalDays` follows the backend's exclusive-end convention:
 * ChronoUnit.DAYS.between(startDate, endDate), so Sep 10 -> Sep 15 is 5 days.
 */
export interface RentalQuote {
  rentalDays: number;
  /** Undiscounted list rate per day, shown struck through when a tier applies. */
  baseDailyRate: number;
  /** Rate per day after the duration discount tier. */
  effectiveDailyRate: number;
  /** 0, 20 or 40 — already expressed as a percentage, not a multiplier. */
  discountPercentage: number;
  /** Authoritative amount the reservation will be persisted with. */
  totalCost: number;
}
