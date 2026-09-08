import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import PageTransition from "../../components/common/PageTransition";
import styles from "./DashboardPage.module.scss";
import type { Reservation } from "../../types/Reservation";

interface HubInfo {
  cityLabel: string;
  address: string;
  hours: string;
}

const HUBS: Record<string, HubInfo> = {
  warsaw: {
    cityLabel: "Warsaw",
    address: "VeloCity Hub Śródmieście, ul. Marszałkowska 10, 00-001 Warszawa",
    hours: "Mon–Sun, 7:00–22:00",
  },
  wroclaw: {
    cityLabel: "Wrocław",
    address: "VeloCity Hub Rynek, ul. Oławska 5, 50-123 Wrocław",
    hours: "Mon–Sun, 8:00–21:00",
  },
  poznan: {
    cityLabel: "Poznań",
    address: "VeloCity Hub Centrum, ul. Półwiejska 25, 61-888 Poznań",
    hours: "Mon–Sun, 8:00–21:00",
  },
  gdansk: {
    cityLabel: "Gdańsk",
    address: "VeloCity Hub Główne Miasto, ul. Długa 30, 80-827 Gdańsk",
    hours: "Mon–Sun, 8:00–21:00",
  },
};

const normalizeCity = (value?: string) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getHubByCity = (city?: string): HubInfo | null => {
  const key = normalizeCity(city);
  if (["warsaw", "warszawa"].includes(key)) return HUBS.warsaw;
  if (["wroclaw", "wrocław"].includes(key)) return HUBS.wroclaw;
  if (["poznan", "poznań"].includes(key)) return HUBS.poznan;
  if (["gdansk", "gdańsk"].includes(key)) return HUBS.gdansk;
  return null;
};

const DashboardPage = () => {
  const jwtToken = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userCity = user?.city;

  const [activeRentals, setActiveRentals] = useState<number>(0);
  const [activeBikesCount, setActiveBikesCount] = useState<number>(0);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchActiveRentals = async () => {
      if (!userId || !jwtToken) return;

      try {
        const response = await fetch(`${apiUrl}/api/v1/reservations/my`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (response.ok && isJson) {
          const data = await response.json();
          const active = data.data.filter(
            (r: Reservation) => r.status === "CONFIRMED",
          ).length;
          setActiveRentals(active);
        }
      } catch (error) {
        console.error("Failed to fetch active rentals:", error);
      }
    };

    const fetchActiveBikes = async () => {
      if (!userId || !jwtToken) return;

      try {
        const response = await fetch(
          `${apiUrl}/api/v1/fleet/count?city=${userCity}&status=ACTIVE`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (response.ok && isJson) {
          const data = await response.json();
          setActiveBikesCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch fleet count:", error);
      }
    };

    fetchActiveRentals();
    fetchActiveBikes();
  }, [userId, userCity, jwtToken]);

  const hubInfo = useMemo(() => getHubByCity(userCity), [userCity]);

  if (!user) return null;

  return (
    <PageTransition>
      <main className={styles.dashboardPage}>
        <section className={styles.welcomeSection}>
          <h1>
            Hello,{" "}
            <span className={styles.highlight}>
              {user.fullName.split(" ")[0]}
            </span>
            .
          </h1>
          <p className={styles.subtitle}>Ready for your next ride?</p>
          {hubInfo && (
            <div className={styles.hubNotice} role="note" aria-live="polite">
              <div className={styles.hubIcon} aria-hidden="true">📍</div>
              <div className={styles.hubContent}>
                <div className={styles.hubLine}>
                  Pick-up hub{" "}
                  <span className={styles.hubCity}>({hubInfo.cityLabel})</span>:
                  <span className={styles.hubAddress}> {hubInfo.address}</span>
                </div>
                <div className={styles.hubHours}>Hours: {hubInfo.hours}</div>
              </div>
            </div>
          )}
        </section>

        {/* --- Stats Grid --- */}
        <section className={styles.statsGrid} aria-label="User Statistics">
          <article className={styles.statCard}>
            <h3>Rentals</h3>
            <div className={styles.statValue}>
              {activeRentals}
              <span className={styles.statUnit}>
                {activeRentals === 1 ? "bike" : "bikes"}
              </span>
            </div>
            <div
              className={`${styles.statusIndicator} ${
                activeRentals > 0 ? styles.active : ""
              }`}
            >
              {activeRentals > 0 ? "Active" : "No active rides"}
            </div>
          </article>

          <article className={styles.statCard}>
            <h3>Fleet Status</h3>
            <div className={styles.statValue}>{activeBikesCount}</div>
            <p className={styles.statLabel}>E-bikes nearby</p>
          </article>

          <article className={styles.statCard}>
            <h3>Your Impact</h3>
            <div className={styles.statValue}>128 km</div>
            <p className={styles.statLabel}>Total distance ridden</p>
          </article>
        </section>

        {/* --- Actions Grid --- */}
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <section className={styles.actionsGrid} aria-label="Quick Actions">
          <Link
            to="/rent-bike"
            className={`${styles.actionCard} ${styles.primaryAction}`}
          >
            <div className={styles.icon} aria-hidden="true">🚲</div>
            <div className={styles.actionInfo}>
              <h3>Rent a Bike</h3>
              <p>Find and book an e-bike near you</p>
            </div>
            <div className={styles.arrow} aria-hidden="true">➜</div>
          </Link>

          <Link to="/profile" className={styles.actionCard}>
            <div className={styles.icon} aria-hidden="true">👤</div>
            <div className={styles.actionInfo}>
              <h3>My Profile</h3>
              <p>Update your personal details</p>
            </div>
            <div className={styles.arrow} aria-hidden="true">➜</div>
          </Link>

          <Link to="/my-rentals" className={styles.actionCard}>
            <div className={styles.icon} aria-hidden="true">📜</div>
            <div className={styles.actionInfo}>
              <h3>Ride History</h3>
              <p>View your ride history</p>
            </div>
            <div className={styles.arrow} aria-hidden="true">➜</div>
          </Link>
        </section>
      </main>
    </PageTransition>
  );
};

export default DashboardPage;