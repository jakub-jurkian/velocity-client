import type { City } from "./Fleet";

// The four operational states a physical bike can be in, per the backend
// `BikeStatus` enum. Order here drives the filter chips and the status select
// in the edit modal, so it is deliberately not alphabetical: it follows the
// bike's typical lifecycle (in service -> temporarily out -> permanently out).
export const BIKE_STATUSES = ["ACTIVE", "MAINTENANCE", "LOST", "RETIRED"] as const;

export type BikeInstanceStatus = (typeof BIKE_STATUSES)[number];

// Mirrors the backend `BikeInstanceResponse` returned by
// GET /api/v1/admin/bikes: the model name flattened in, plus the `version`
// the optimistic-lock status update needs.
export interface AdminBike {
  id: string;
  status: BikeInstanceStatus;
  city: City;
  bikeModelName: string;
  version: number;
}

// One reservation standing in the way of taking a bike out of service.
// Mirrors the backend `ConflictDto`, which arrives as a `conflicts` array on
// the ProblemDetail body of a 409 from
// `PATCH /api/v1/admin/bikes/{id}/status`.
export interface BikeStatusConflict {
  reservationId: string;
  userEmail: string;
  startDate: string;
  endDate: string;
}
