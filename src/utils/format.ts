import { format, parseISO } from "date-fns";

const pln = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
const plnWhole = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number, { whole = false } = {}) =>
  (whole ? plnWhole : pln).format(amount);

// Takes the API's 'YYYY-MM-DD'. parseISO keeps it a local date, where
// new Date() would read it as UTC midnight and could shift it a day.
export const formatDate = (isoDate: string, pattern = "MMM d, yyyy") =>
  format(parseISO(isoDate), pattern);

// API enum to label: "HEAVY_DUTY" -> "Heavy duty", "ACTIVE" -> "Active".
export const humanize = (value: string) => {
  const words = value.toLowerCase().replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};
