# VeloCity — Electric Bike Rental Platform

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **VeloCity** is a full-featured electric bike rental management system built for delivery couriers and urban riders across four Polish cities. It covers the full lifecycle of a rental: browsing the fleet, booking a bike, processing payment, managing a user profile, and administering the platform from an analytics-rich admin panel.

> **Current state:** The frontend is fully self-contained, using `localStorage` as a temporary data layer. The `src/api/client.ts` module already points to `http://localhost:8080` and is ready to connect to a real backend — that migration is the next major milestone (see [Backend section](#backend--java-spring-boot-recommended)).

---

## 📸 Screenshots

|                        Landing Page                         |                         User Dashboard                          |
| :---------------------------------------------------------: | :-------------------------------------------------------------: |
| ![Landing Page Placeholder](docs/images/landing-preview.png) | ![User Dashboard Placeholder](docs/images/dashboard-preview.png) |

|                     Admin Analytics                      |                        Mobile View                        |
| :------------------------------------------------------: | :-------------------------------------------------------: |
| ![Admin Panel Placeholder](docs/images/admin-panel-preview.png) | ![Mobile View Placeholder](docs/images/mobile-preview.png) |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Domain Model](#domain-model)
- [State Management](#state-management)
- [Pricing Logic](#pricing-logic)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Backend — Java Spring Boot (Recommended)](#backend--java-spring-boot-recommended)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Customer-facing
- **Landing page** with hero section and animated call-to-action
- **Fleet browser** — view all bike models with stats (speed, range, cargo capacity)
- **Pricing page** — transparent per-day rates with dynamic discount tiers
- **Rent Bike Wizard** — multi-step flow: bike selection → date picker → payment → confirmation
- **My Dashboard** — overview of active and upcoming rentals
- **My Rentals** — full booking history with one-click CSV export
- **My Profile** — edit personal details and account info
- **Contact page** — inquiry form
- **About page** — company information

### Admin panel (`/admin`)
- **Panel** — analytics dashboard with monthly revenue chart, fleet occupancy rate, and model popularity (Recharts)
- **Calendar** — visualise all reservations across the fleet (React Big Calendar)
- **User Management** — list, search, and block/unblock registered users

### Cross-cutting
- Role-based access control (`client` / `admin`) with protected and public-only routes
- "Remember Me" toggle — persists session to `localStorage` vs `sessionStorage`
- **Collision-detection algorithm** prevents double-booking of any individual bike instance
- Automatic reservation status transitions (`confirmed` → `completed` once end date passes)
- Cancellation guard — past trips cannot be cancelled
- Page transitions via Framer Motion
- Toast notifications (React Hot Toast)
- Fully typed with TypeScript

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build tool | Vite 7 |
| Routing | React Router v7 |
| State management | Redux Toolkit + React-Redux |
| Styling | SCSS Modules + CSS variables |
| Animations | Framer Motion |
| Calendar | React Big Calendar |
| Charts | Recharts |
| Date utilities | date-fns |
| Notifications | React Hot Toast |
| Linting | ESLint + typescript-eslint |

---

## 🏗️ Project Structure

```
src/
├── api/
│   └── client.ts               # Generic HTTP client (GET/POST/PUT/PATCH/DELETE) → localhost:8080
├── components/
│   ├── Auth/                   # ProtectedRoute, PublicOnlyRoute
│   ├── LandingBtn/             # Reusable CTA button
│   ├── MainLayout/             # Navbar + Footer wrapper
│   └── common/                 # PageLoader, PageTransition, ScrollToTop, Redirect
├── hooks/
│   └── useForm.ts              # Generic form state + validation + submit handler (no library)
├── pages/
│   ├── Admin/                  # AdminLayout, PanelPage, CalendarPage, UserManagementPage
│   ├── DashboardPage/
│   ├── FleetPage/
│   ├── LandingPage/
│   ├── LoginPage/
│   ├── MyProfilePage/
│   ├── NotFoundPage/
│   ├── PricingPage/
│   ├── RegisterPage/
│   ├── RentBikePage/           # Multi-step wizard:
│   │   └── components/         #   StepBikeSelection → StepDateSelection → StepLoading → StepPayment → StepSummary
│   ├── RentalsPage/
│   └── UnauthorizedPage/
├── store/
│   ├── index.ts
│   ├── hooks.ts
│   └── slices/authSlice.ts     # Auth state: user, isAuthenticated, login/logout/updateUser
├── styles/                     # Global SCSS, variables, toast overrides
├── types/
│   ├── Fleet.ts                # BikeModel, BikeInstance
│   ├── Reservation.ts          # Reservation
│   └── User.ts                 # User
└── utils/
    ├── analyticsHelper.ts      # Monthly revenue, occupancy rate, popularity stats
    ├── bookingHelper.ts        # Availability check, add/cancel/get reservations
    ├── exportHelper.ts         # CSV download
    ├── fleetStorage.ts         # Bike model & instance seed data + getters
    ├── paymentHelper.ts        # Simulated payment (80% success rate, 2s delay)
    ├── rentalCalculations.ts   # getRentalDays (inclusive), getDynamicPrice
    ├── toastConfig.ts
    ├── userStorage.ts          # Mock users, CRUD helpers
    └── validators.ts           # Email, min-length validators
```

---

## Pages & Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/about` | Public | About page |
| `/fleet` | Public | Bike model catalogue |
| `/pricing` | Public | Pricing tiers |
| `/contact` | Public | Contact form |
| `/login` | Public only | Login (redirects away if authenticated) |
| `/register` | Public only | Registration |
| `/dashboard` | Client + Admin | Rental overview dashboard |
| `/rent-bike` | Client + Admin | Booking wizard |
| `/my-rentals` | Client + Admin | Booking history + CSV export |
| `/profile` | Client + Admin | Edit profile |
| `/admin/panel` | Admin only | Analytics dashboard |
| `/admin/calendar` | Admin only | Reservation calendar |
| `/admin/users` | Admin only | User management |
| `/unauthorized` | Public | 403 page |

---

## Domain Model

### `User`
```ts
{
  id: string;
  fullName: string;
  email: string;
  password: string;       // plaintext in mock — must be hashed in the backend
  phone: string;
  role: "client" | "admin";
  status: "active" | "blocked";
  joinedDate: string;     // ISO date string
  city: "Warsaw" | "Gdansk" | "Poznan" | "Wroclaw";
}
```

### `BikeModel` (catalogue entry / blueprint)
```ts
{
  id: string;             // "s1" | "xl" | "ep2"
  name: string;
  category: string;
  description: string;
  stats: { speed: number; range: number; capacity: number };
  imageEmoji: string;
}
```

### `BikeInstance` (physical asset)
```ts
{
  id: string;             // e.g. "war-s1-04" — city prefix + model + zero-padded index
  modelId: string;        // foreign key → BikeModel.id
  city: string;
  status: "active" | "maintenance" | "lost" | "retired";
}
```

### `Reservation`
```ts
{
  id: string;             // e.g. "VELO-A3B7C2"
  bikeId: string;         // foreign key → BikeInstance.id
  userId: string;
  startDate: string;      // ISO date string
  endDate: string;        // ISO date string
  totalCost: number;      // PLN
  status: "confirmed" | "cancelled" | "completed";
}
```

### Fleet — City & Model Distribution

| City | S1 Sprint | XL Cargo | EP2 Endurance | Total |
|---|---|---|---|---|
| Warsaw | 15 | 5 | 8 | 28 |
| Gdansk | 8 | 2 | 5 | 15 |
| Poznan | 12 | 2 | 4 | 18 |
| Wroclaw | 8 | 3 | 6 | 17 |
| **Total** | **43** | **12** | **23** | **78** |

---

## State Management

Redux Toolkit manages a single `auth` slice. Everything else is read from `localStorage` helpers, which will be swapped out for `api/client.ts` calls once the backend is live.

```
authSlice
  ├── user: User | null
  ├── isAuthenticated: boolean
  ├── loginSuccess(user)      — sets user, marks authenticated
  ├── loginFailure()          — clears state
  ├── logout()                — clears state + both storages
  └── updateUser(partial)     — merges fields, syncs to active storage
```

---

## Pricing Logic

Base rate: **25 PLN / day**

| Duration | Discount | Effective Daily Rate |
|---|---|---|
| 1–7 days | None | 25 PLN |
| 8–14 days | 20% | 20 PLN |
| 15–21 days | 40% | 15 PLN |

`getRentalDays` counts **inclusively** (Mon → Mon = 8 days, not 7). `totalCost` must be recalculated server-side; never trust the value submitted by the client.

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** or **yarn**

### Installation

```bash
# 1. Clone
git clone https://github.com/JakubJurkian/temporal-resource-allocation-system.git
cd velocity

# 2. Install dependencies
npm install

# 3. Start dev server (backend expected at localhost:8080)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Mock credentials (seeded into localStorage on first load)

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | 123456 |
| Client | client@test.com | 123456 |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the Java backend |

Copy `.env.example` to `.env` and set the variable for your environment.

---

## Backend — Java Spring Boot (Recommended)

The API client (`src/api/client.ts`) uses `credentials: "include"`, so the backend can use HTTP-only cookies for auth — no `Authorization` header plumbing needed on the frontend.

### Recommended Stack

| Concern | Library / Tool |
|---|---|
| Framework | Spring Boot 3.x |
| Security | Spring Security 6 |
| Auth | JWT stored in HTTP-only cookie (`jjwt` library) |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL (prod) / H2 (local/test) |
| Migrations | Flyway |
| Validation | `jakarta.validation` (Bean Validation) |
| Build | Maven or Gradle |
| API docs | SpringDoc OpenAPI (Swagger UI at `/swagger-ui`) |

### Suggested Package Structure

```
com.velocity/
├── config/         # SecurityConfig, CorsConfig, JwtConfig
├── controller/     # REST controllers (one per domain)
├── dto/            # Request / Response DTOs (decoupled from entities)
├── entity/         # JPA entities: User, BikeModel, BikeInstance, Reservation
├── exception/      # GlobalExceptionHandler (@ControllerAdvice), custom exceptions
├── repository/     # Spring Data JPA repositories
├── security/       # JwtFilter, UserDetailsServiceImpl
└── service/        # Business logic: AuthService, ReservationService, FleetService, AnalyticsService
```

### CORS — Required Config

The browser sends credentials, so `*` is not allowed:

```java
// CorsConfig.java
config.setAllowedOrigins(List.of("http://localhost:5173")); // Vite dev, add prod origin
config.setAllowCredentials(true);
config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("*"));
```

### REST API Endpoints

#### Auth — `/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{ fullName, email, password, phone, city }` | Register new user |
| `POST` | `/auth/login` | `{ email, password }` | Authenticate — set JWT cookie |
| `POST` | `/auth/logout` | — | Clear JWT cookie |
| `GET` | `/auth/me` | — | Return current authenticated user |

#### Users — `/users`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List all users |
| `GET` | `/users/{id}` | Admin / own | Get single user |
| `PATCH` | `/users/{id}` | Admin / own | Update profile fields |
| `PATCH` | `/users/{id}/status` | Admin | Block / unblock |
| `DELETE` | `/users/{id}` | Admin | Delete user |

#### Fleet — `/bikes`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/bikes/models` | Public | List all bike models |
| `GET` | `/bikes` | Public | List instances (`?city=Warsaw&status=active`) |
| `GET` | `/bikes/{id}` | Public | Single instance detail |
| `PATCH` | `/bikes/{id}/status` | Admin | Update instance status |

#### Reservations — `/reservations`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/reservations` | Admin | All reservations |
| `GET` | `/reservations/my` | Client | Current user's reservations |
| `POST` | `/reservations` | Client | Create — runs server-side collision detection |
| `PATCH` | `/reservations/{id}/cancel` | Client / Admin | Cancel a booking |
| `GET` | `/reservations/availability` | Client | `?bikeId=&startDate=&endDate=` |

#### Analytics — `/analytics` (Admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/analytics/revenue` | Monthly revenue aggregated |
| `GET` | `/analytics/occupancy` | Current-month occupancy rate |
| `GET` | `/analytics/popularity` | Rental count per bike model |

### Key Business Rules to Implement Server-side

1. **Collision detection** — before inserting a `Reservation`, query for overlapping active reservations on the same `bikeId`. Return `409 Conflict` if found.
2. **Auto-complete** — use a `@Scheduled` task to flip `CONFIRMED` → `COMPLETED` for reservations whose `endDate` has passed. Alternatively compute status on read.
3. **Cancellation guard** — reject cancellation requests where `startDate` is today or in the past.
4. **Password hashing** — use `BCryptPasswordEncoder`. Never store plaintext.
5. **Role enforcement** — Spring Security method security (`@PreAuthorize("hasRole('ADMIN')")`) on all admin-only endpoints.
6. **Server-side pricing** — recalculate `totalCost` from `startDate`/`endDate` on the backend; never accept the client's submitted value.

### JPA Entity Sketch

```java
@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    private BikeInstance bike;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status; // CONFIRMED, CANCELLED, COMPLETED
}
```

### Suggested Development Milestones

| # | Milestone | Scope |
|---|---|---|
| 1 | **Auth** | `/auth/register`, `/auth/login`, `/auth/me`, JWT cookie, Spring Security config |
| 2 | **Fleet** | Seed DB with models & instances via Flyway migration, expose `/bikes` endpoints |
| 3 | **Reservations** | Create + list + cancel with server-side collision detection |
| 4 | **Admin** | User management endpoints, analytics queries |
| 5 | **Frontend wiring** | Replace all `localStorage` helpers with `api.*` calls from `client.ts` |

---

## 💡 Best Practices Implemented

- **Component Composition** — `AdminLayout` with `<Outlet />`, `PageTransition` wrapping content avoids prop drilling and keeps layouts composable.
- **Separation of Concerns** — UI in React components, logic in custom hooks (`useForm`), data access in utils.
- **Custom Form Engine** — `useForm.ts` handles values, errors, submission state, and validation without any form library.
- **Semantic HTML** — proper `<header>`, `<main>`, `<nav>` usage throughout for accessibility.
- **API client ready** — `src/api/client.ts` is a typed, generic HTTP wrapper. Swapping localStorage for real API calls requires only updating the util functions.

---

## 🤝 Contributing

1. Fork the project.
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.