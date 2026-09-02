import type { Reservation } from "../types/Reservation";
import type { BikeModel } from "../types/Fleet";

// Helper: Get duration in days between two dates
const getDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

// REVENUE CHART DATA - Aggregates total income per month.
// Uses: Array.reduce, Object.keys, Array.map
export const getMonthlyRevenue = (reservations: Reservation[]) => {
  const grouped = reservations.reduce((acc, res) => {
    // Extract "YYYY-MM"
    const monthKey = res.startDate.substring(0, 7); 
    
    if (res.status !== "CANCELLED") {
      acc[monthKey] = (acc[monthKey] || 0) + res.totalCost;
    }
    return acc;
  }, {} as Record<string, number>);

  // Transform object back to array for the Chart
  return Object.keys(grouped)
    .sort()
    .map((key) => ({
      name: key, // e.g. "2025-12"
      revenue: grouped[key],
    }));
};

// OCCUPANCY RATE (%) - Formula: (Total Days Rented / (Total Bikes * Days in Month)) * 100

export const getOccupancyRate = (
  reservations: Reservation[], 
  totalFleetSize: number
) => {
  const currentMonth = new Date().toISOString().substring(0, 7); // "2024-05"
  const daysInMonth = 30; // Approximation for MVP

  // Filter reservations active in this month
  const activeRes = reservations.filter(
    (r) => r.startDate.startsWith(currentMonth) && r.status !== "CANCELLED"
  );

  // Sum total days rented
  const totalDaysRented = activeRes.reduce((sum, res) => {
    return sum + getDuration(res.startDate, res.endDate);
  }, 0);

  // Total Capacity = 50 bikes * 30 days = 1500 available slots
  const totalCapacity = totalFleetSize * daysInMonth;

  if (totalCapacity === 0) return 0;
  
  return Math.round((totalDaysRented / totalCapacity) * 100);
};

// BIKE POPULARITY - Which models are rented most?
export const getPopularityStats = (reservations: Reservation[], models: BikeModel[]) => {
  const counts = reservations.reduce((acc, res) => {
    // res.bikeId is like "war-xl-01", we need "xl" (model id)
    const modelId = res.bike.id.split("-")[1];
    if (res.status !== "CANCELLED") {
      acc[modelId] = (acc[modelId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return models.map((m) => ({
    name: m.name,
    count: counts[m.id] || 0,
  }));
};