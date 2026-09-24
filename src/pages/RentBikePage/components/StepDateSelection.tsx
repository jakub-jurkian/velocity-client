import { useState, type FormEvent } from "react";
import { addDays, differenceInCalendarDays, format, isAfter, parseISO } from "date-fns";
import type { City } from "../../../types/Fleet";
import { CITY_LABELS } from "../../../data/cities";
import { MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "../../../data/rental";
import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import { Form, TextField } from "../../../components/ui/Form";
import styles from "../RentBikePage.module.scss";

type Dates = { start: string; end: string };

const isoDay = (date: Date) => format(date, "yyyy-MM-dd");

// The pickers' min and max are only hints, and a typed date can bypass them,
// so the range is checked again before asking the API. Strings compare safely
// because both are 'YYYY-MM-DD'.
const rangeError = ({ start, end }: Dates) => {
  if (!start || !end) return "Please select both dates.";
  if (end < start) return "End date cannot be before start date.";
  // Mirrors @Future on ReservationBookRequest.startDate.
  if (start <= isoDay(new Date())) return "Bookings must start from tomorrow onwards.";

  // Exclusive end, like the backend: Sep 10 -> Sep 15 is 5 days.
  const days = differenceInCalendarDays(parseISO(end), parseISO(start));
  if (days < MIN_RENTAL_DAYS) return `Minimum rental period is ${MIN_RENTAL_DAYS} days.`;
  if (days > MAX_RENTAL_DAYS) return `Maximum rental period is ${MAX_RENTAL_DAYS} days.`;
  return "";
};

interface Props {
  dates: Dates;
  setDates: (dates: Dates) => void;
  city: City;
  // Called once the range is valid.
  onSearch: () => void;
}

export default function StepDateSelection({ dates, setDates, city, onSearch }: Props) {
  const [error, setError] = useState("");

  const earliestStart = isoDay(addDays(new Date(), 1));
  // The end date is exclusive server-side, so a 21-day rental ends on start + 21.
  const earliestReturn = dates.start && isoDay(addDays(parseISO(dates.start), MIN_RENTAL_DAYS));
  const latestReturn = dates.start && isoDay(addDays(parseISO(dates.start), MAX_RENTAL_DAYS));

  const handleChange = (field: keyof Dates, value: string) => {
    setError("");
    const next = { ...dates, [field]: value };
    // A start moved past the chosen end clears the end.
    if (field === "start" && next.end && isAfter(parseISO(value), parseISO(next.end))) {
      next.end = "";
    }
    setDates(next);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const problem = rangeError(dates);
    if (problem) setError(problem);
    else onSearch();
  };

  return (
    <div className={styles.step}>
      <Callout icon="📍" title="Browsing fleet in" className={styles.banner}>
        <span className={styles.city}>{CITY_LABELS[city]}</span>
      </Callout>

      <h1>When do you need it?</h1>
      <p className={styles.subtitle}>
        Select your rental dates ({MIN_RENTAL_DAYS}-{MAX_RENTAL_DAYS} days). Bookings start
        from tomorrow.
      </p>

      <Form onSubmit={handleSubmit} noValidate>
        <TextField
          id="startDate"
          label="Start Date"
          type="date"
          value={dates.start}
          onChange={(e) => handleChange("start", e.target.value)}
          min={earliestStart}
          required
        />

        <div>
          <TextField
            id="endDate"
            label="End Date"
            type="date"
            value={dates.end}
            onChange={(e) => handleChange("end", e.target.value)}
            min={earliestReturn || undefined}
            max={latestReturn || undefined}
            disabled={!dates.start}
            required
          />
          {earliestReturn && latestReturn && (
            <div className={styles.returnWindow}>
              <div className={styles.returnBound}>
                <span className={styles.boundLabel}>Earliest return</span>
                <span className={styles.boundDate}>
                  {format(parseISO(earliestReturn), "EEE, d MMM")}
                </span>
              </div>
              <div className={styles.returnBound}>
                <span className={styles.boundLabel}>Latest return</span>
                <span className={styles.boundDate}>
                  {format(parseISO(latestReturn), "EEE, d MMM")}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <Callout tone="danger" icon="⚠️" role="alert">
            {error}
          </Callout>
        )}

        <Button type="submit" size="lg" block>
          Find Bikes ➜
        </Button>
      </Form>
    </div>
  );
}
