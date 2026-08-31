import PageTransition from "../../components/common/PageTransition";
import styles from "./AboutPage.module.scss";

const stats = [
  { number: "2.5M", label: "Kilometers Ridden" },
  { number: "140t", label: "CO₂ Saved" },
  { number: "4", label: "Cities Active" },
  { number: "24/7", label: "Support Team" },
];

const values = [
  {
    icon: "🌱",
    title: "Sustainability First",
    description:
      "Every bike is charged using 100% renewable energy sources. We recycle 95% of our battery components.",
  },
  {
    icon: "🚀",
    title: "Radical Speed",
    description:
      "No traffic jams. No parking hunting. Our fleet is optimized for the quickest point-A to point-B travel.",
  },
  {
    icon: "🛡️",
    title: "Safety by Design",
    description:
      "GPS tracking, automatic collision detection, and regular maintenance checks ensure you ride safe.",
  },
];

const AboutPage = () => {
  return (
    <PageTransition>
      <div className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.glowOrb} aria-hidden="true"></div>
          <h1>
            Moving Cities <br />
            <span className={styles.gradientText}>Forward.</span>
          </h1>
          <p className={styles.lead}>
            We are VeloCity. We believe the future of urban transport is silent,
            clean, and incredibly fast. Our mission is to replace 100,000 car
            trips with e-bike rides by 2027.
          </p>
        </section>

        {/* Stats Grid */}
        <section className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <h2>Our Core Values</h2>
          <div className={styles.valueRow}>
            {values.map((value) => (
              <div key={value.title} className={styles.valueItem}>
                <h3>
                  {value.icon} {value.title}
                </h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
