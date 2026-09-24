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
    title: "Sustainability First",
    description:
      "Every bike is charged using 100% renewable energy sources. We recycle 95% of our battery components.",
  },
  {
    title: "Radical Speed",
    description:
      "No traffic jams. No parking hunting. Our fleet is optimized for the quickest point-A to point-B travel.",
  },
  {
    title: "Safety by Design",
    description:
      "GPS tracking, automatic collision detection, and regular maintenance checks ensure you ride safe.",
  },
];

const AboutPage = () => (
  <PageTransition>
    <section className={styles.hero}>
      <h1>
        Moving Cities <br />
        <span className={styles.gradientText}>Forward.</span>
      </h1>
      <p className={styles.lead}>
        We are VeloCity. We believe the future of urban transport is silent, clean, and
        incredibly fast. Our mission is to replace 100,000 car trips with e-bike rides by 2030.
      </p>
    </section>

    <section className={styles.statsGrid} aria-label="Company Statistics">
      {stats.map((stat) => (
        <article key={stat.label} className={styles.statCard}>
          <span className={styles.statNumber}>{stat.number}</span>
          <span className={styles.statLabel}>{stat.label}</span>
        </article>
      ))}
    </section>

    <section>
      <h2 className={styles.valuesTitle}>Our Core Values</h2>
      <div className={styles.valueRow}>
        {values.map((value) => (
          <article key={value.title}>
            <h3 className={styles.valueTitle}>{value.title}</h3>
            <p className={styles.valueText}>{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  </PageTransition>
);

export default AboutPage;
