export interface Reservation {
  id: string;
  bikeId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}
