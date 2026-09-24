import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch, toastError } from "../../../api/client";
import { formatCurrency } from "../../../utils/format";
import { cx } from "../../../utils/cx";
import PageTransition from "../../../components/common/PageTransition";
import PageHeader from "../../../components/ui/PageHeader";
import StatCard from "../../../components/ui/StatCard";
import styles from "./PanelPage.module.scss";

// Mirrors the backend analytics response.
interface Analytics {
  revenueTrend: { month: number; year: number; revenue: number }[];
  popularityStats: { modelName: string; count: number }[];
  totalRevenue: number;
  occupancyRate: number;
  activeRentals: number;
}

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AXIS = { stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false } as const;

const TOOLTIP = {
  contentStyle: {
    backgroundColor: "#1e1e1e",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
  },
  itemStyle: { color: "#fff" },
  separator: "",
};

const PanelPage = () => {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<Analytics>("/api/v1/admin/analytics", { signal: controller.signal })
      .then(setData)
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Dashboard fetch error:", error);
        toastError(error, "Could not load real-time analytics.");
      });

    return () => controller.abort();
  }, []);

  const revenueData = useMemo(
    () =>
      (data?.revenueTrend ?? []).map((r) => ({ name: `${r.month}/${r.year}`, revenue: r.revenue })),
    [data],
  );
  const popularityData = data?.popularityStats ?? [];

  return (
    <PageTransition>
      <PageHeader size="md" title="Dashboard Overview" subtitle="Real-time fleet analytics." />

      <section className={styles.kpiGrid} aria-label="Key Performance Indicators">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data?.totalRevenue ?? 0, { whole: true })}
          hint="Confirmed and completed bookings"
        />
        {/*
          Both figures are a snapshot of today, not a period average: the API
          counts confirmed bookings whose dates span today, and divides that
          by the bikes currently in service.
        */}
        <StatCard
          label="Fleet in Use"
          value={`${data?.occupancyRate ?? 0}%`}
          hint="Of in-service bikes, right now"
        />
        <StatCard
          label="Rides in Progress"
          value={data?.activeRentals ?? 0}
          hint="Bikes out with customers today"
        />
      </section>

      <div className={styles.chartsGrid}>
        <section className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue Trend</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <BarChart data={revenueData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" dy={10} {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip
                  {...TOOLTIP}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  formatter={(value) => [formatCurrency(Number(value) || 0, { whole: true }), ""]}
                />
                <Bar dataKey="revenue" fill="#00F0FF" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={cx(styles.chartCard, styles.pieCard)}>
          <h2 className={styles.chartTitle}>Fleet Popularity</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <PieChart>
                <Pie
                  data={popularityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="modelName"
                  stroke="none"
                >
                  {popularityData.map((item, index) => (
                    <Cell key={item.modelName} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP} formatter={(value) => [value, "Bookings: "]} />
                <Legend
                  verticalAlign="bottom"
                  height={72}
                  iconType="circle"
                  formatter={(value) => <span className={styles.legendText}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default PanelPage;
