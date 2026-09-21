import { useState, useMemo } from "react";
import { format, addDays, parseISO, isAfter } from "date-fns";
import styles from "../RentBikePage.module.scss";
import type { City } from "../../../types/Fleet";

const MIN_RENTAL_DAYS = 3;
const MAX_RENTAL_DAYS = 21;

interface Props {
  dates: { start: string; end: string };
  setDates: (d: { start: string; end: string }) => void;
  onSubmit: (e: React.FormEvent, setError: (msg: string) => void) => void;
  city: City;
}

export default function StepDateSelection({
  dates,
  setDates,
  onSubmit,
  city,
}: Props) {
  const [error, setError] = useState("");

  /**
   * Earliest bookable start date, mirroring `@Future` on
   * ReservationBookRequest.startDate: tomorrow, never today.
   *
   * A same-day rental is unbookable by design. Pricing is whole-day with no
   * time component, so a booking made in the evening would charge a full day
   * for a few hours. It is also uncancellable: the domain refuses a cancel
   * once the current date is no longer before the start date, which is true
   * from the moment a same-day booking exists.
   */
  const earliestStartDate = useMemo(
    () => format(addDays(new Date(), 1), "yyyy-MM-dd"),
    [],
  );

  // The end date is exclusive server-side (days = end - start), so a 21-day
  // rental ends on start + 21 and a 3-day rental ends on start + 3.
  const maxEndDate = useMemo(() => {
    if (!dates.start) return undefined;

    // Use date-fns to safely add days ignoring timezone shifts
    const maxDate = addDays(parseISO(dates.start), MAX_RENTAL_DAYS);
    return format(maxDate, "yyyy-MM-dd");
  }, [dates.start]);

  const minEndDate = useMemo(() => {
    if (!dates.start) return undefined;

    const minDate = addDays(parseISO(dates.start), MIN_RENTAL_DAYS);
    return format(minDate, "yyyy-MM-dd");
  }, [dates.start]);

  const handleDateChange = (field: "start" | "end", value: string) => {
    if (error) setError("");

    const newDates = { ...dates, [field]: value };

    // UX Fix: If start date moves past end date, clear the end date
    if (field === "start" && newDates.end) {
      if (isAfter(parseISO(value), parseISO(newDates.end))) {
        newDates.end = "";
      }
    }

    setDates(newDates);
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.locationBanner}>
        <span className={styles.pinIcon} aria-hidden="true">
          📍
        </span>
        <div className={styles.bannerText}>
          <span className={styles.label}>Browsing fleet in</span>
          <span className={styles.city}>{city}</span>
        </div>
      </div>

      <h1>When do you need it?</h1>
      <p className={styles.subtitle}>
        Select your rental dates ({MIN_RENTAL_DAYS}-{MAX_RENTAL_DAYS} days).
        Bookings start from tomorrow.
      </p>

      <form onSubmit={(e) => onSubmit(e, setError)} className={styles.dateForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={dates.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            min={earliestStartDate}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            value={dates.end}
            onChange={(e) => handleDateChange("end", e.target.value)}
            // No fallback needed: minEndDate is always set once a start date
            // exists, and the field is disabled until then.
            min={minEndDate}
            max={maxEndDate}
            disabled={!dates.start}
            className={styles.input}
            required
          />
          {dates.start && (
            <span className={styles.helperText}>
              Min return date: {minEndDate} <br />
              Max return date: {maxEndDate}
            </span>
          )}
        </div>

        {error && <div className={styles.errorBox}>⚠️ {error}</div>}

        <button type="submit" className={styles.primaryBtn}>
          Find Bikes ➜
        </button>
      </form>
    </div>
  );
}
