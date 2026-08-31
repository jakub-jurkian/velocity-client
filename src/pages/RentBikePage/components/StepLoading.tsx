import styles from "../RentBikePage.module.scss";

interface Props {
  city: "WARSAW" | "GDANSK" | "POZNAN" | "WROCLAW";
}

export default function StepLoading({ city }: Props) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Checking availability in {city}...</p>
    </div>
  );
}
