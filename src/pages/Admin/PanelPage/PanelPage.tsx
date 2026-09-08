import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";
import PageTransition from "../../../components/common/PageTransition";
import { useAppSelector } from "../../../store/hooks";
import styles from "./PanelPage.module.scss";

// Explicit TypeScript interfaces for type safety
interface RevenueItem {
  name: string;
  revenue: number;
}

interface PopularityItem {
  modelName: string;
  count: number;
  [key: string]: string | number;
}

interface DashboardState {
  revenueData: RevenueItem[];
  popularityData: PopularityItem[];
  kpi: {
    revenue: number;
    occupancy: number;
    activeRentals: number;
  };
}

const PanelPage = () => {
  const jwtToken = useAppSelector((state) => state.auth.token);

  // Typed state to prevent never[] inference bugs
  const [dashboard, setDashboard] = useState<DashboardState>({
    revenueData: [],
    popularityData: [],
    kpi: {
      revenue: 0,
      occupancy: 0,
      activeRentals: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!jwtToken) return;

        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type") || "";
          const isJson =
            contentType.includes("application/problem+json") ||
            contentType.includes("application/json");

          if (isJson) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to load analytics.");
          } else {
            throw new Error(`Server error: ${response.status}`);
          }
        }

        const data = await response.json();

        setDashboard({
          revenueData: data.revenueTrend.map(
            (r: { month: number; year: number; revenue: number }) => ({
              name: `${r.month}/${r.year}`,
              revenue: r.revenue,
            }),
          ),
          popularityData: data.popularityStats,
          kpi: {
            revenue: data.totalRevenue,
            occupancy: data.occupancyRate,
            activeRentals: data.activeRentals,
          },
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Could not load real-time analytics.");
      }
    };

    fetchDashboardData();
  }, [jwtToken]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Enterprise currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <PageTransition>
      <main className={styles.panelPage}>
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Real-time fleet analytics.</p>
        </header>

        {/* KPI CARDS */}
        <section
          className={styles.kpiGrid}
          aria-label="Key Performance Indicators"
        >
          <div className={styles.card}>
            <h3>Total Revenue</h3>
            <div className={styles.value}>
              {formatCurrency(dashboard.kpi.revenue)}
            </div>
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
        </section>

        {/* CHARTS GRID */}
        <div className={styles.chartsGrid}>
          {/* CHART 1: REVENUE */}
          <section
            className={`${styles.card} ${styles.chartCard} ${styles.revenueCard}`}
          >
            <h3>Revenue Trend</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={280}
              >
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
                    formatter={(value) => [
                      formatCurrency(Number(value) || 0),
                      "",
                    ]}
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
          </section>

          {/* CHART 2: POPULARITY */}
          <section
            className={`${styles.card} ${styles.chartCard} ${styles.pieCard}`}
          >
            <h3>Fleet Popularity</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={280}
              >
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
                    formatter={(value) => [value, "Bookings: "]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={72}
                    iconType="circle"
                    formatter={(value) => (
                      <span className={styles.legendText}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </PageTransition>
  );
};

export default PanelPage;
