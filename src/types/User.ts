import type { City } from "./Fleet";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "ACTIVE" | "BLOCKED";
  joinedDate: string;
  city: City;
}

export const SUPPORTED_ROLES = ["USER", "ADMIN"] as const;

export type UserRole = (typeof SUPPORTED_ROLES)[number];
