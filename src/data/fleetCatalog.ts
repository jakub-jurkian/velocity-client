import type { BikeModel } from "../types/Fleet";

/**
 * Marketing catalogue for the public fleet page.
 *
 * This is static on purpose. `/fleet` is a public marketing
 * route and the API exposes no unauthenticated bike-model endpoint: the only
 * source of model data is GET /api/v1/reservations/availability, which requires
 * a bearer token plus a date range and a city.
 *
 * The specs below are kept in lockstep with the `bike_models` rows in
 * db/changelog/dev/999-dev-seed.xml so the marketing page cannot contradict
 * what a signed-in user is offered during booking:
 *
 *   Sprint Courier S1   AGILITY       45 km/h   80 km   40 kg
 *   Endurance Pro 2.0   DUAL_BATTERY  35 km/h  100 km   60 kg
 *   Cargo King XL       HEAVY_DUTY    25 km/h   60 km  100 kg
 *
 * `imageEmoji` has no backend counterpart and is presentation only.
 *
 */
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
