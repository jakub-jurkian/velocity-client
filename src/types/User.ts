export interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: "CLIENT" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  joinedDate: string;
  city: "WARSAW" | "GDANSK" | "POZNAN" | "WROCLAW";
}
