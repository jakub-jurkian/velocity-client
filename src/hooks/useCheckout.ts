import { useState } from "react";
import toast from "react-hot-toast";

export const useCheckout = (jwtToken: string | null) => {
  // True while the two-call booking round trip is in flight: POST
  // /reservations to create the PENDING row, then POST .../confirm to drive
  // it to CONFIRMED. The summary button reads this to show a spinner and to
  // refuse a second click, which would otherwise create a duplicate booking
  // that only the database exclusion constraint would stop.

  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeCheckout = async (
    bikeInstanceId: string,
    startDate: string,
    endDate: string,
    onSuccess: () => void,
    onConflict: () => void, // Callback to kick user back to Step 2
  ) => {
    setIsSubmitting(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      // Create Reservation
      const response = await fetch(`${apiUrl}/api/v1/reservations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bikeInstanceId, startDate, endDate }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(
            "Concurrent booking conflict: This bike was just reserved. Please select another.",
          );
          onConflict();
          return; // Exit early
        }
        // If it's a 500 or 400 error, throw to the catch block
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Confirm Reservation
      const confirmRes = await fetch(
        `${apiUrl}/api/v1/reservations/${data.id}/confirm`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      );

      if (!confirmRes.ok) {
        throw new Error("Finalizing the reservation failed.");
      }

      toast.success("Reservation booked successfully!");
      onSuccess();
    } catch (error: unknown) {
      console.error("Checkout failed:", error);
      toast.error("An unexpected error occurred during checkout.");
    } finally {
      // Every exit path clears the flag, including the early return on a 409.
      // Leaving it set would strand the button in a permanent spinner after a
      // conflict, with no way back other than a reload.
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, executeCheckout };
};
