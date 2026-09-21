import type { City } from "./Fleet";

export const SUPPORTED_ROLES = ["CLIENT", "ADMIN"] as const;

export type UserRole = (typeof SUPPORTED_ROLES)[number];

export type UserStatus = "ACTIVE" | "BLOCKED";

/**
 * Mirrors the backend `UserProfileResponse` returned by GET /api/v1/auth/me.
 * This is the signed-in user's own profile: it carries `city` but no `status`,
 * because a blocked account cannot authenticate in the first place.
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  city: City;
  createdAt: string;
}

/**
 * Mirrors the backend `AdminUserResponse` returned by GET /api/v1/admin/users.
 *
 * Kept separate from {@link User} because the two projections differ: the admin
 * view carries `status`, the self profile does not. Collapsing them into one
 * shape is what previously rendered "Invalid Date" in the admin table.
 */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  city: City;
  createdAt: string;
}
