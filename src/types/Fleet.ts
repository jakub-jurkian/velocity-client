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
  imageEmoji: string;
}

// The Physical Bike (The real asset)
export interface BikeInstance {
  id: string;
  modelId: string;
  city: City;
  status: "ACTIVE" | "MAINTENANCE" | "LOST" | "RETIRED";
}

export interface ApiBike {
  bookableInstanceId: string;
  modelName: string;
  modelCategory: string;
  modelDescription: string;
  modelSpeed: string;
  modelRange: string;
  modelCapacity: string;
}

export const SUPPORTED_CITIES = [
  "WARSAW",
  "GDANSK",
  "POZNAN",
  "WROCLAW",
] as const;

export type City = (typeof SUPPORTED_CITIES)[number];
