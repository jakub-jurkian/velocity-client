import type { BikeModel, City } from "../../../types/Fleet";
import type { WizardStep } from "../../../types/Wizard";
import styles from "../RentBikePage.module.scss";

interface Props {
  availableBikes: BikeModel[];
  city: City;
  setStep: (step: WizardStep) => void;
  onBookBike: (bikeId: string) => void;
}

export default function StepBikeSelection({
  availableBikes,
  city,
  setStep,
  onBookBike,
}: Props) {
  return (
    <div className={styles.stepContainer}>
      <button onClick={() => setStep(1)} className={styles.backBtn}>
        ← Change Dates
      </button>

      <h1>Available Bikes</h1>
      <p className={styles.subtitle}>
        Found {availableBikes.length} bike
        {availableBikes.length === 1 ? "" : "s"} for your dates.
      </p>

      <div className={styles.bikeList}>
        {availableBikes.length === 0 ? (
          <div className={styles.noResults}>
            <p>😔 No bikes available in {city} for these dates.</p>
            <button onClick={() => setStep(1)} className={styles.retryBtn}>
              Try different dates
            </button>
          </div>
        ) : (
          availableBikes.map((bike) => (
            <div key={bike.id} className={styles.bikeCard}>
              <div className={styles.bikeInfo}>
                <h3>
                  {bike.name}
                  {bike.imageEmoji && (
                    <span className={styles.bikeEmoji} aria-hidden="true">
                      {bike.imageEmoji}
                    </span>
                  )}
                </h3>

                <div className={styles.specs}>
                  <span className={styles.spec} title="Category">
                    <span aria-hidden="true">🏷️</span> {bike.category}
                  </span>
                  <span className={styles.spec} title="Max Speed">
                    <span aria-hidden="true">⚡</span> {bike.stats.speed} km/h
                  </span>
                  <span className={styles.spec} title="Range">
                    <span aria-hidden="true">🛣️</span> {bike.stats.range} km
                  </span>
                  <span className={styles.spec} title="Cargo Capacity">
                    <span aria-hidden="true">📦</span> {bike.stats.capacity} kg
                  </span>
                </div>
              </div>

              <button
                className={styles.bookBtn}
                onClick={() => onBookBike(bike.id)}
                aria-label={`Book ${bike.name}`} // Crucial for accessibility
              >
                Book
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
