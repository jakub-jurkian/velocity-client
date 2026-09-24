import PageTransition from "../../components/common/PageTransition";
import Button from "../../components/ui/Button";
import IconCard from "../../components/ui/IconCard";
import styles from "./LandingPage.module.scss";

const stats = [
  { value: "100 km", label: "Max Range / Charge" },
  { value: "45 km/h", label: "Max Speed" },
  { value: "0 PLN", label: "Maintenance Cost" },
];

const features = [
  {
    icon: "🔋",
    title: "Infinite Range",
    description: "Swap batteries at any VeloCity Hub in under 30 seconds.",
  },
  {
    icon: "🛡️",
    title: "Full Insurance",
    description: "Accidents happen. We cover repairs so you keep earning.",
  },
  {
    icon: "📱",
    title: "Smart App",
    description: "Book bikes and manage them via phone.",
  },
];

const LandingPage = () => (
  <PageTransition>
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        OWN THE <span className={styles.gradientText}>RIDE</span>. <br />
        OWN YOUR <span className={styles.gradientText}>SHIFT</span>.
      </h1>
      <p className={styles.heroSubtitle}>
        The premium e-bike fleet for professional couriers.
        <br />
        Unlimited battery swaps. Zero maintenance. 100% Profit.
      </p>

      <div className={styles.ctaGroup}>
        <Button to="/rent-bike" size="lg">
          Start Riding
        </Button>
        <Button to="/fleet" variant="secondary" size="lg">
          View Fleet
        </Button>
      </div>
    </section>

    <section className={styles.statsBar}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.statItem}>
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </div>
      ))}
    </section>

    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>
        Built for <span className={styles.highlight}>Delivery</span>
      </h2>

      <div className={styles.grid}>
        {features.map((feature) => (
          <IconCard key={feature.title} icon={feature.icon} title={feature.title}>
            {feature.description}
          </IconCard>
        ))}
      </div>
    </section>
  </PageTransition>
);

export default LandingPage;
