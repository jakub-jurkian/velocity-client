// Allowed booking length in days. Days are counted the backend's way, with an
// exclusive end (ChronoUnit.DAYS.between), so Sep 10 -> Sep 15 is 5 days.
export const MIN_RENTAL_DAYS = 3;
export const MAX_RENTAL_DAYS = 21;
