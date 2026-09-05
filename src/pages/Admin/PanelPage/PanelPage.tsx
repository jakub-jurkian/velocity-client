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

import { useAppSelector } from "../../../store/hooks";
import { useEffect, useState } from "react";

const PanelPage = () => {
  const jwtToken = useAppSelector((state) => state.auth.token);
  const [dashboard, setDashboard] = useState({
    revenueData: [],
    popularityData: [],
    kpi: {
      revenue: 0,
      occupancy: 0,
      activeRentals: 0,
    },
  });

  const fetchDashboardData = async () => {
    // Heavy calculations
    // const revenueChart = getMonthlyRevenue(reservations);
    // const popularityChart = getPopularityStats(reservations, models);

    // const totalRevenue = reservations.reduce(
    //   (sum, r) => (r.status !== "CANCELLED" ? sum + r.totalCost : sum),
    //   0,
    // );
    // const occupancy = getOccupancyRate(reservations, models.length * 5);
    // const active = reservations.filter((r) => r.status === "CONFIRMED").length;
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/admin/analytics",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      console.log(data.revenueTrend);
      return {
        revenueData: data.revenueTrend.map((r) => {
          return { name: `${r.month}/${r.year}`, revenue: r.revenue };
        }),
        popularityData: data.popularityStats,
        kpi: {
          revenue: data.totalRevenue,
          occupancy: data.occupancyRate,
          activeRentals: data.activeRentals,
        },
      };
    } catch (error) {
      console.error(error);
    }

    return;
  };

  useEffect(() => {
    fetchDashboardData().then((data) => {
      if (data) {
        setDashboard(data);
      }
    });
  }, [jwtToken]);

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
            <div className={styles.value}>{dashboard.kpi.revenue} PLN</div>
          </div>
          <div className={styles.card}>
            <h3>Occupancy Rate</h3>
            <div className={styles.value}>{dashboard.kpi.occupancy}%</div>
            <div className={styles.subtext}>Monthly Average</div>
          </div>
          <div className={styles.card}>
            <h3>Active Rentals</h3>
            <div className={styles.value}>{dashboard.kpi.activeRentals}</div>
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
                <BarChart data={dashboard.revenueData} margin={{ left: -20 }}>
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
                    separator=""
                    formatter={(value) => [value, ""]}
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
                    data={dashboard.popularityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="modelName"
                    stroke="none"
                  >
                    {dashboard.popularityData.map((_, index) => (
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
                    itemStyle={{ color: "#fff" }}
                    separator=""
                    formatter={(value) => [value, ""]}
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
