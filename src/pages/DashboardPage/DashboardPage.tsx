import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { apiFetch } from "../../api/client";
import { fetchAllPages } from "../../api/pagination";
import { CITY_HUBS, CITY_LABELS } from "../../data/cities";
import type { Reservation } from "../../types/Reservation";
import { cx } from "../../utils/cx";
import PageTransition from "../../components/common/PageTransition";
import Badge from "../../components/ui/Badge";
import Callout from "../../components/ui/Callout";
import StatCard from "../../components/ui/StatCard";
import styles from "./DashboardPage.module.scss";

const QUICK_ACTIONS = [
  { to: "/rent-bike", icon: "🚲", title: "Rent a Bike", text: "Find and book an e-bike near you", primary: true },
  { to: "/profile", icon: "👤", title: "My Profile", text: "Update your personal details" },
  { to: "/my-rentals", icon: "📜", title: "Ride History", text: "View your ride history" },
];

const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userCity = user?.city;

  const [activeRentals, setActiveRentals] = useState(0);
  const [bikesNearby, setBikesNearby] = useState(0);

  useEffect(() => {
    if (!userId || !userCity) return;
    const controller = new AbortController();
    const { signal } = controller;

    // A true aggregate, not a screenful, so it walks every page. Counting only
    // the first page under-reported anyone with more reservations than the
    // default page size.
    fetchAllPages<Reservation>("/api/v1/reservations/my", { signal })
      .then((all) => setActiveRentals(all.filter((r) => r.status === "CONFIRMED").length))
      .catch((error) => {
        if (!signal.aborted) console.error("Failed to fetch active rentals:", error);
      });

    apiFetch<{ count: number } | null>("/api/v1/fleet/count", {
      query: { city: userCity, status: "ACTIVE" },
      signal,
    })
      .then((data) => setBikesNearby(data?.count ?? 0))
      .catch((error) => {
        if (!signal.aborted) console.error("Failed to fetch fleet count:", error);
      });

    return () => controller.abort();
  }, [userId, userCity]);

  if (!user) return null;

  const hub = CITY_HUBS[user.city];

  return (
    <PageTransition>
      <section className={styles.welcome}>
        <h1>
          Hello, <span className={styles.highlight}>{user.fullName.split(" ")[0]}</span>.
        </h1>
        <p className={styles.subtitle}>Ready for your next ride?</p>
        {hub && (
          <Callout icon="📍" title={`Pick-up hub · ${CITY_LABELS[user.city]}`} role="note">
            <span className={styles.hubAddress}>{hub.address}</span>
            <span className={styles.hubHours}>Hours: {hub.hours}</span>
          </Callout>
        )}
      </section>

      <section className={styles.statsGrid} aria-label="User Statistics">
        <StatCard label="Rentals" value={activeRentals} unit={activeRentals === 1 ? "bike" : "bikes"}>
          <Badge tone={activeRentals > 0 ? "success" : "neutral"}>
            {activeRentals > 0 ? "Active" : "No active rides"}
          </Badge>
        </StatCard>
        <StatCard label="Fleet Status" value={bikesNearby} hint="E-bikes nearby" />
        <StatCard label="Your Impact" value="0 km" hint="Total distance ridden" />
      </section>

      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <section className={styles.actionsGrid} aria-label="Quick Actions">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={cx(styles.actionCard, action.primary && styles.primaryAction)}
          >
            <div className={styles.icon} aria-hidden="true">
              {action.icon}
            </div>
            <div className={styles.actionInfo}>
              <h3>{action.title}</h3>
              <p>{action.text}</p>
            </div>
            <div className={styles.arrow} aria-hidden="true">
              ➜
            </div>
          </Link>
        ))}
      </section>
    </PageTransition>
  );
};

export default DashboardPage;
