import type { ReactNode } from "react";
import type { BikeModel } from "../../types/Fleet";
import styles from "./BikeModelCard.module.scss";

interface Props {
  model: BikeModel;
  // Smaller tile for lists inside a narrower column, e.g. the booking step.
  compact?: boolean;
  // Rendered under the stats, e.g. a Book button.
  action?: ReactNode;
}

interface Stat {
  label: string;
  value: string;
  // Bar fill, 0–100.
  percent: number;
}

const statsFor = ({ stats }: BikeModel): Stat[] => [
  // Speed is scaled against ~40 km/h and range against ~100 km.
  {
    label: "Speed",
    value: `${stats.speed} km/h`,
    percent: (stats.speed / 40) * 100,
  },
  { label: "Range", value: `${stats.range} km`, percent: stats.range },
  // Capacity is already a 1–100 score on the backend.
  { label: "Capacity", value: `${stats.capacity}%`, percent: stats.capacity },
];

//  The bike-model tile shared by the public fleet page and the booking step, so
//  a model looks the same where it is advertised and where it is booked.
const BikeModelCard = ({ model, compact = false, action }: Props) => (
  <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
    <div className={styles.visual}>
      <div className={styles.categoryTag}>{model.category}</div>
      {model.image ? (
        <img
          className={styles.image}
          src={model.image}
          alt={`${model.name} e-bike`}
          width={960}
          height={720}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.imagePlaceholder} aria-hidden="true">
          {model.imageEmoji ?? "🚲"}
        </div>
      )}
    </div>

    <div className={styles.info}>
      <h2>{model.name}</h2>
      <p className={styles.desc}>{model.description}</p>

      <div className={styles.stats}>
        {statsFor(model).map((stat) => (
          <div key={stat.label} className={styles.statRow}>
            <span className={styles.label}>{stat.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${Math.min(stat.percent, 100)}%` }}
              />
            </div>
            <span className={styles.value}>{stat.value}</span>
          </div>
        ))}
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </div>
  </article>
);

export default BikeModelCard;
