export interface Reservation {
  id: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalCost: number;
  bike: {
    id: string;
    city: string;
    modelName: string;
  };
}
