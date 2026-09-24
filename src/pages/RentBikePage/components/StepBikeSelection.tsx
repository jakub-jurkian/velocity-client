import type { BikeModel, City } from "../../../types/Fleet";
import type { WizardStep } from "../../../types/Wizard";
import BikeModelCard from "../../../components/BikeModelCard/BikeModelCard";
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
            <BikeModelCard
              key={bike.id}
              model={bike}
              compact
              action={
                <button
                  className={styles.bookBtn}
                  onClick={() => onBookBike(bike.id)}
                  aria-label={`Book ${bike.name}`} // Crucial for accessibility
                >
                  Book
                </button>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
