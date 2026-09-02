import type { Reservation } from "../types/Reservation";

export const downloadReservationsCSV = (reservations: Reservation[]) => {
  // Define the Column Headers
  const headers = ["Reservation ID,Bike ID,Start Date,End Date,Status,Cost (PLN)"];

  // Map the data to CSV rows
  const rows = reservations.map((r) => 
    `${r.id},${r.bike.id},${r.startDate},${r.endDate},${r.status},${r.totalCost}`
  );

  // Combine headers and rows with newlines
  const csvContent = [headers, ...rows].join("\n");

  // Create a Blob (File object) in memory
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  
  // Create a fake link and click it
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `velocity_history_${new Date().toISOString().split('T')[0]}.csv`; // e.g. velocity_history_2024-12-29.csv
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};