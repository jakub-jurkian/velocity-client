import type { CSSProperties } from "react";

// "Jan Maria Kowalski" -> "JK", "Cher" -> "C".
export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
};


// A background that is stable per user but differs between users, so a list
// of avatars is scannable instead of a column of identical circles.
 
// Seeded by id rather than name so a rename does not recolour the user.
// Lightness is kept low enough that the white initials stay legible on every
// hue, including yellows.

export const getAvatarStyle = (seed: string): CSSProperties => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;

  return {
    background: `linear-gradient(135deg, hsl(${hue} 65% 42%), hsl(${(hue + 35) % 360} 65% 30%))`,
    color: "#fff",
  };
};
