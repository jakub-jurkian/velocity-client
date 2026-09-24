import type { BikeModel, City } from "../../../types/Fleet";
import { CITY_LABELS } from "../../../data/cities";
import BikeModelCard from "../../../components/BikeModelCard/BikeModelCard";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import styles from "../RentBikePage.module.scss";

interface Props {
  bikes: BikeModel[];
  city: City;
  onBack: () => void;
  onBook: (bike: BikeModel) => void;
}

export default function StepBikeSelection({ bikes, city, onBack, onBook }: Props) {
  return (
    <div className={styles.step}>
      <Button variant="ghost" size="sm" className={styles.back} onClick={onBack}>
        ← Change Dates
      </Button>

      <h1>Available Bikes</h1>
      <p className={styles.subtitle}>
        Found {bikes.length} bike{bikes.length === 1 ? "" : "s"} for your dates.
      </p>

      {bikes.length === 0 ? (
        <EmptyState
          icon="😔"
          title="No bikes available"
          action={
            <Button variant="outline" onClick={onBack}>
              Try different dates
            </Button>
          }
        >
          Every bike in {CITY_LABELS[city]} is taken for these dates.
        </EmptyState>
      ) : (
        <div className={styles.bikeList}>
          {bikes.map((bike) => (
            <BikeModelCard
              key={bike.id}
              model={bike}
              compact
              action={
                <Button onClick={() => onBook(bike)} aria-label={`Book ${bike.name}`}>
                  Book
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
