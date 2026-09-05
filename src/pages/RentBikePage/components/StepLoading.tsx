import type { City } from "../../../types/Fleet";
import styles from "../RentBikePage.module.scss";

interface Props {
  city: City;
}

export default function StepLoading({ city }: Props) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Checking availability in {city}...</p>
    </div>
  );
}
