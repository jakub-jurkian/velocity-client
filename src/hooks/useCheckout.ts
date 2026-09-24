import { useState } from "react";
import toast from "react-hot-toast";
import { ApiError, apiFetch } from "../api/client";

interface Callbacks {
  onSuccess: () => void;
  // Someone else booked the bike first.
  onConflict: () => void;
}

export const useCheckout = () => {
  // True while the two-call booking round trip is in flight: POST
  // /reservations to create the PENDING row, then POST .../confirm to drive
  // it to CONFIRMED. The summary button reads this to show a spinner and to
  // refuse a second click, which would otherwise create a duplicate booking
  // that only the database exclusion constraint would stop.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeCheckout = async (
    bikeInstanceId: string,
    dates: { start: string; end: string },
    { onSuccess, onConflict }: Callbacks,
  ) => {
    setIsSubmitting(true);
    try {
      const { id } = await apiFetch<{ id: string }>("/api/v1/reservations", {
        method: "POST",
        body: { bikeInstanceId, startDate: dates.start, endDate: dates.end },
      });
      await apiFetch(`/api/v1/reservations/${id}/confirm`, { method: "POST" });

      toast.success("Reservation booked successfully!");
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(
          "Concurrent booking conflict: This bike was just reserved. Please select another.",
        );
        onConflict();
        return;
      }
      console.error("Checkout failed:", error);
      toast.error("An unexpected error occurred during checkout.");
    } finally {
      // Every exit path clears the flag, including the early return on a 409.
      // Leaving it set would strand the button in a permanent spinner.
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, executeCheckout };
};
