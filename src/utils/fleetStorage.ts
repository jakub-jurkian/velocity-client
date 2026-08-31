import type { BikeModel, BikeInstance } from "../types/Fleet";

// HARDCODED MODELS (Catalog)
const MODELS: BikeModel[] = [
  {
    id: "s1",
    name: "Sprint Courier S1",
    category: "Agility",
    stats: { speed: 45, range: 80, capacity: 40 },
    description:
      "The choice for city centers. Lightweight and agile enough to weave through traffic jams. Perfect for backpack delivery.",
    imageEmoji: "🛵",
  },
  {
    id: "xl",
    name: "Cargo King XL",
    category: "Heavy Duty",
    description:
      "Large grocery order? 10 Pizzas? No problem. Features a front insulated box and heavy-duty rear rack.",
    stats: { speed: 25, range: 60, capacity: 100 },
    imageEmoji: "🍕",
  },
  {
    id: "ep2",
    name: "Endurance Pro 2.0",
    category: "Dual-battery system",
    description:
      "Built for the 10-hour shift warrior. Dual-battery system ensures you never run out of juice during the dinner rush.",
    stats: { speed: 35, range: 100, capacity: 60 },
    imageEmoji: "🔋",
  },
];

type FleetConfigItem = {
  modelId: "s1" | "xl" | "ep2";
  city: string;
  amount: number;
};

// CONFIG FOR GENERATION
const FLEET_CONFIG: FleetConfigItem[] = [
  { modelId: "s1", city: "Warsaw", amount: 15 },
  { modelId: "ep2", city: "Warsaw", amount: 8 },
  { modelId: "xl", city: "Warsaw", amount: 5 },

  { modelId: "s1", city: "Gdansk", amount: 8 },
  { modelId: "ep2", city: "Gdansk", amount: 5 },
  { modelId: "xl", city: "Gdansk", amount: 2 },

  { modelId: "s1", city: "Poznan", amount: 12 },
  { modelId: "ep2", city: "Poznan", amount: 4 },
  { modelId: "xl", city: "Poznan", amount: 2 },

  { modelId: "s1", city: "Wroclaw", amount: 8 },
  { modelId: "ep2", city: "Wroclaw", amount: 6 },
  { modelId: "xl", city: "Wroclaw", amount: 3 },
];

export const initializeFleet = () => {
  // Save Models to Storage
  if (!localStorage.getItem("velocity_models")) {
    localStorage.setItem("velocity_models", JSON.stringify(MODELS));
  }

  // Generate Instances if missing
  if (!localStorage.getItem("velocity_fleet")) {
    const instances: BikeInstance[] = [];

    FLEET_CONFIG.forEach((cfg) => {
      for (let i = 1; i <= cfg.amount; i++) {
        instances.push({
          id: `${cfg.city.substring(0, 3).toLowerCase()}-${
            cfg.modelId
          }-${String(i).padStart(2, "0")}`, // id: war-s1-01
          modelId: cfg.modelId, // <--- LINK TO MODEL
          city: cfg.city,
          status: "ACTIVE",
        });
      }
    });

    localStorage.setItem("velocity_fleet", JSON.stringify(instances));
  }
};

// GETTERS
export const getModels = (): BikeModel[] => {
  try {
    const data = localStorage.getItem("velocity_models");
    return data ? JSON.parse(data) : MODELS;
  } catch (error) {
    console.error("Local storage corrupted, falling back to defaults", error);
    return MODELS;
  }
};

export const getFleet = (): BikeInstance[] => {
  try {
    const data = localStorage.getItem("velocity_fleet");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Fleet storage corrupted", error);
    return [];
  }
};