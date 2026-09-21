import type { BikeModel } from "../types/Fleet";

// Marketing catalogue for the public fleet page.

export const FLEET_CATALOG: BikeModel[] = [
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
