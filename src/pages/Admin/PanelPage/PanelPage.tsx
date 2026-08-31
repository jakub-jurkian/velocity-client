import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import PageTransition from "../../../components/common/PageTransition";
import styles from "./PanelPage.module.scss";
import {
  getMonthlyRevenue,
  getOccupancyRate,
  getPopularityStats,
} from "../../../utils/analyticsHelper";
import type { Reservation } from "../../../types/Reservation";
import type { BikeModel } from "../../../types/Fleet";

const getAllReservations = (): Reservation[] => {
  return [];
};

const PanelPage = () => {
  // OPTIMIZATION: Replaced useState with useMemo
  // This logic now runs ONLY once on mount, or if dependencies change.
  // It separates "Calculation" from "State".
  const dashboardData = useMemo(() => {
    const reservations = getAllReservations();
    const models: BikeModel[] = [];

    // Heavy calculations
    const revenueChart = getMonthlyRevenue(reservations);
    const popularityChart = getPopularityStats(reservations, models);

    const totalRevenue = reservations.reduce(
      (sum, r) => (r.status !== "CANCELLED" ? sum + r.totalCost : sum),
      0,
    );
    const occupancy = getOccupancyRate(reservations, models.length * 5);
    const active = reservations.filter((r) => r.status === "CONFIRMED").length;

    return {
      revenueData: revenueChart,
      popularityData: popularityChart,
      kpi: {
        revenue: totalRevenue,
        occupancy: occupancy,
        activeRentals: active,
      },
    };
  }, []); // Empty array = Calculate once on mount (Component Did Mount)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <PageTransition>
      <div className={styles.panelPage}>
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Real-time fleet analytics.</p>
        </header>

        {/* KPI CARDS */}
        <div className={styles.kpiGrid}>
          <div className={styles.card}>
            <h3>Total Revenue</h3>
            <div className={styles.value}>{dashboardData.kpi.revenue} PLN</div>
          </div>
          <div className={styles.card}>
            <h3>Occupancy Rate</h3>
            <div className={styles.value}>{dashboardData.kpi.occupancy}%</div>
            <div className={styles.subtext}>Monthly Average</div>
          </div>
          <div className={styles.card}>
            <h3>Active Rentals</h3>
            <div className={styles.value}>
              {dashboardData.kpi.activeRentals}
            </div>
            <div className={styles.subtext}>Current live bookings</div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className={styles.chartsGrid}>
          {/* CHART 1: REVENUE */}
          <div
            className={`${styles.card} ${styles.chartCard} ${styles.revenueCard}`}
          >
            <h3>Revenue Trend</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.revenueData}
                  margin={{ left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      backgroundColor: "#1e1e1e",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#00F0FF"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: POPULARITY */}
          <div
            className={`${styles.card} ${styles.chartCard} ${styles.pieCard}`}
          >
            <h3>Fleet Popularity</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.popularityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {dashboardData.popularityData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e1e1e",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: "#94A3B8", fontSize: "12px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PanelPage;
