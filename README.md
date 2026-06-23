# Velocity (Frontend Client)

> React/TypeScript client for the [VeloCity API](https://github.com/jakub-jurkian/velocity-api) (Java/Spring Boot). Provides a booking interface for customers and an analytics dashboard for fleet admins.

[Live Demo](https://temporal-resource-allocation-system.vercel.app/)

---

## Highlights

* **Client-side conflict checks:** Before sending a reservation request, the client checks the selected dates against the bike's known bookings to catch obvious conflicts early — the API still owns the final, authoritative check (optimistic locking) since two clients can race each other.
* **Role-based routing:** Customer and Admin views are separated at the routing level, so an unauthenticated or wrong-role user can't reach admin pages.
* **Admin dashboard:** Revenue and fleet-utilization charts (Recharts) for fleet administrators (not fully implemented).

---

## Tech Stack
* **Core:** React 19, TypeScript
* **State:** Redux Toolkit
* **Styling:** SCSS Modules, Tailwind CSS

---

## Getting Started

```bash
git clone [https://github.com/jakub-jurkian/velocity.git](https://github.com/jakub-jurkian/velocity.git)
cd velocity
npm install
npm run dev
```

Points to the API at http://localhost:8080 by default — see .env.example to change it.

## License
MIT
