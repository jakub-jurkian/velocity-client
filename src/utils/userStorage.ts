import type { User } from "../types/User";

const MOCK_ADMIN: User = {
  id: "1d8e7n4s",
  fullName: "Piotr Kowalski",
  email: "admin@test.com",
  password: "123456",
  role: "ADMIN",
  phone: "+48 000 000 000",
  city: "WARSAW",
  status: "ACTIVE",
  joinedDate: "2025-01-15"
};

const MOCK_CLIENT: User = {
  id: "4e2d7f4n",
  fullName: "Adam Nowak",
  email: "client@test.com",
  password: "123456",
  role: "CLIENT",
  phone: "+48 111 111 111",
  city: "GDANSK",
  status: "ACTIVE",
  joinedDate: "2025-04-10"
};

export const initializeUsers = () => {
  const users = localStorage.getItem("velocity_users");
  if (!users) {
    localStorage.setItem(
      "velocity_users",
      JSON.stringify([MOCK_ADMIN, MOCK_CLIENT])
    );
    console.log("Storage initialized with Mock Users");
  }
};

export const addUserToStorage = (user: User) => {
  const currentData = localStorage.getItem("velocity_users");
  const users = currentData ? JSON.parse(currentData) : [];
  users.push(user);
  localStorage.setItem("velocity_users", JSON.stringify(users));
}

export const getUsersFromStorage = (): User[] => {
  const currentData = localStorage.getItem("velocity_users");
  return currentData ? JSON.parse(currentData) : [];
};
