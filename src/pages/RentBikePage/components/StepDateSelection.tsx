import { useState, useMemo } from "react";
import { format, addDays, parseISO, isAfter } from "date-fns";
import styles from "../RentBikePage.module.scss";
import type { City } from "../../../types/Fleet";

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

  // Safely get local date as YYYY-MM-DD
  const today = format(new Date(), "yyyy-MM-dd");

  const maxEndDate = useMemo(() => {
    if (!dates.start) return undefined;
    
    // Use date-fns to safely add days ignoring timezone shifts
    const maxDate = addDays(parseISO(dates.start), MAX_RENTAL_DAYS - 1);
    return format(maxDate, "yyyy-MM-dd");
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
        <span className={styles.pinIcon} aria-hidden="true">📍</span>
        <div className={styles.bannerText}>
          <span className={styles.label}>Browsing fleet in</span>
          <span className={styles.city}>{city}</span>
        </div>
      </div>

      <h1>When do you need it?</h1>
      <p className={styles.subtitle}>
        Select your rental dates (3-{MAX_RENTAL_DAYS} days).
      </p>

      <form onSubmit={(e) => onSubmit(e, setError)} className={styles.dateForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={dates.start}
            onChange={(e) => handleDateChange("start", e.target.value)}
            min={today}
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
            min={dates.start || today}
            max={maxEndDate}
            disabled={!dates.start}
            className={styles.input}
            required
          />
          {dates.start && (
            <span className={styles.helperText}>
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