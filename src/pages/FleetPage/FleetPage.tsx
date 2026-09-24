import PageTransition from "../../components/common/PageTransition";
import BikeModelCard from "../../components/BikeModelCard/BikeModelCard";
import PageHeader from "../../components/ui/PageHeader";
import { FLEET_CATALOG } from "../../data/fleetCatalog";
import styles from "./FleetPage.module.scss";

const FleetPage = () => (
  <PageTransition>
    <PageHeader
      align="center"
      title="Delivery Fleet."
      subtitle="Reliable tools for professional couriers. Minimize downtime, maximize tips."
    />

    <div className={styles.bikeList}>
      {FLEET_CATALOG.map((model) => (
        <BikeModelCard key={model.id} model={model} />
      ))}
    </div>
  </PageTransition>
);

export default FleetPage;
