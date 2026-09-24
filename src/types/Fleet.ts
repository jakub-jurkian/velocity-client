import type { RentalQuote } from "./Pricing";

// The blueprint for bikes
export interface BikeModel {
  id: string;
  name: string;
  category: string;
  description: string;
  stats: {
    speed: number;
    range: number;
    capacity: number;
  };
  // Marketing-only decoration: the API never sends it.
  imageEmoji?: string;
}

// The Physical Bike (The real asset)
export interface BikeInstance {
  id: string;
  modelId: string;
  city: City;
  status: "ACTIVE" | "MAINTENANCE" | "LOST" | "RETIRED";
}

export const BIKE_CATEGORIES = [
  "AGILITY",
  "HEAVY_DUTY",
  "DUAL_BATTERY",
] as const;

export type BikeCategory = (typeof BIKE_CATEGORIES)[number];

// Mirrors the backend `AvailableBikeModel` record.
// Numeric specs arrive as JSON numbers, not strings.
export interface AvailableBikeModel {
  bookableInstanceId: string;
  modelName: string;
  modelCategory: BikeCategory;
  modelDescription: string;
  modelSpeed: number;
  modelRange: number;
  modelCapacity: number;
}

// Mirrors the backend `AvailabilityResponse` record returned by
// GET /api/v1/reservations/availability.

// The quote is priced server-side for the requested date range and is the
// single source of truth for money — the client never recomputes it.
export interface AvailabilityResponse {
  quote: RentalQuote;
  models: AvailableBikeModel[];
}

export const SUPPORTED_CITIES = [
  "WARSAW",
  "GDANSK",
  "POZNAN",
  "WROCLAW",
] as const;

export type City = (typeof SUPPORTED_CITIES)[number];
