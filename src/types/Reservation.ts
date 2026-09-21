export interface Reservation {
  id: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalCost: number;
  /**
   * Set only when someone other than the customer ended the booking — today
   * that means an admin taking the bike off the road. A self-cancellation
   * leaves this null, which is what lets the UI tell the two apart instead of
   * showing every cancelled booking the same way.
   */
  cancellationReason: string | null;
  bike: {
    id: string;
    city: string;
    modelName: string;
  };
}
