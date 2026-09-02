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
  city: "GDANSK" | "POZNAN" | "WARSAW" | "WROCLAW";
  status: "ACTIVE" | "MAINTENANCE" | "LOST" | "RETIRED";
}
