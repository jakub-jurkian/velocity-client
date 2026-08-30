# Velocity (Frontend Client)

> React 19 / TypeScript frontend for the [velocity-api](https://github.com/jakub-jurkian/velocity-fleet-api) bike rental platform. Provides a customer booking flow and an admin analytics dashboard, designed to interface directly with the Java/Spring Boot production backend.

[Live Demo](https://temporal-resource-allocation-system.vercel.app/)

---

## Highlights

* **Reservation conflict detection:** Checks selected dates against existing bookings for the same bike before sending a reservation request. The client-side check serves as an early UX optimization to catch obvious overlap, while the backend API owns the final, authoritative validation via DB-level constraints and optimistic locking.
* **Role-based routing:** `ProtectedRoute` components separate Customer and Admin views at the router level, managing client-side navigation paths to complement the API-level authorization guards.
* **Admin dashboard:** Revenue, occupancy-rate, and bike-popularity charts built with **Recharts**; an interactive reservation schedule using `react-big-calendar`; and administrative user management utilities.
* **Custom `useForm` hook:** A generic, type-safe form state and validation engine built natively without external form libraries to keep the bundle lightweight.

---

## Tech Stack

* **Core:** `React 19`, `TypeScript`, `Vite`
* **State & Routing:** `Redux Toolkit`, `React Router v7`
* **UI & Animation:** `SCSS Modules`, `Framer Motion`, `React Hot Toast`
* **Data Visualization:** `Recharts`, `react-big-calendar`, `date-fns`

---

**Prerequisites:** Node.js 18+, a running instance of [`velocity-api`](https://github.com/jakub-jurkian/velocity-api).

```bash
# Clone the repository
git clone https://github.com/jakub-jurkian/velocity.git
cd velocity

# Install dependencies and set environment variables
npm install
cp .env.example .env   # open .env to configure VITE_API_BASE_URL

# Launch development server
npm run dev
```

The application runs locally at http://localhost:5173 and communicates with the backend API address specified in VITE_API_BASE_URL (defaults to http://localhost:8080).

## License
MIT
