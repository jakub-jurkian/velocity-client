import PageTransition from "../../components/common/PageTransition";
import { FLEET_CATALOG as bikeModels } from "../../data/fleetCatalog";
import styles from "./FleetPage.module.scss";

const FleetPage = () => {
  return (
    <PageTransition>
      <div className={styles.fleetPage}>
        <div className={styles.header}>
          <h1>Delivery Fleet.</h1>
          <p>
            Reliable tools for professional couriers. Minimize downtime, maximize
            tips.
          </p>
        </div>

        <div className={styles.bikeList}>
          {bikeModels.map((model) => (
            <article key={model.id} className={styles.bikeCard}>
              {/* Visual Side */}
              <div className={styles.visual}>
                <div className={styles.categoryTag}>{model.category}</div>
                <div className={styles.bikeImagePlaceholder} aria-hidden="true">
                  {model.imageEmoji}
                </div>
              </div>

              {/* Info Side */}
              <div className={styles.info}>
                <h2>{model.name}</h2>
                <p className={styles.desc}>{model.description}</p>

                <div className={styles.statsContainer}>
                  {/* Stat: Speed */}
                  <div className={styles.statRow}>
                    <span className={styles.label}>Speed</span>
                    <div className={styles.barTrack}>
                      {/* Scaled based on max speed approx 40km/h */}
                      <div
                        className={styles.barFill}
                        style={{ width: `${(model.stats.speed / 40) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.value}>{model.stats.speed} km/h</span>
                  </div>

                  {/* Stat: Range */}
                  <div className={styles.statRow}>
                    <span className={styles.label}>Range</span>
                    <div className={styles.barTrack}>
                      {/* Scaled based on max range approx 100km */}
                      <div
                        className={styles.barFill}
                        style={{ width: `${(model.stats.range / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className={styles.value}>{model.stats.range} km</span>
                  </div>

                  {/* Stat: Capacity */}
                  <div className={styles.statRow}>
                    <span className={styles.label}>Capacity</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${model.stats.capacity}%` }}
                      ></div>
                    </div>
                    <span className={styles.value}>{model.stats.capacity}%</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default FleetPage;
