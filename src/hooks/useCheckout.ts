import { useState } from "react";
import toast from "react-hot-toast";
import { processPayment } from "../utils/paymentHelper";

export const useCheckout = (jwtToken: string | null) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const executeCheckout = async (
    bikeInstanceId: string,
    startDate: string,
    endDate: string,
    onSuccess: () => void,
    onConflict: () => void, // Callback to kick user back to Step 2
  ) => {
    setPaymentStatus("processing");
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      await processPayment();

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
          setPaymentStatus("idle");
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

      setPaymentStatus("success");
      toast.success("Reservation booked successfully!");
      onSuccess();
    } catch (error: unknown) {
      console.error("Checkout failed:", error);
      toast.error("An unexpected error occurred during checkout.");
      setPaymentStatus("error");
    }
  };

  return { paymentStatus, setPaymentStatus, executeCheckout };
};
