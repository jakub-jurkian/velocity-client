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
  id: string; // UNIQUE: e.g., 'waw-s1-04'
  modelId: string; // Link back to blueprint
  city: string;
  status: "ACTIVE" | "MAINTENANCE" | "LOST" | "RETIRED";
}
