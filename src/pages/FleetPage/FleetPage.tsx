import PageTransition from "../../components/common/PageTransition";
import BikeModelCard from "../../components/BikeModelCard/BikeModelCard";
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
            <BikeModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default FleetPage;
