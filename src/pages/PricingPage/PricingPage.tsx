import { MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "../../data/rental";
import { cx } from "../../utils/cx";
import PageTransition from "../../components/common/PageTransition";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./PricingPage.module.scss";

// Marketing copy only: the price of an actual booking always comes from the
// API's quote.
const PRICING_TIERS = [
  { duration: "3 - 7 Days", name: "Weekender", price: 25 },
  { duration: "8 - 14 Days", name: "Rider", price: 20, discount: "~20% OFF", isPopular: true },
  { duration: "15 - 21 Days", name: "Pro Rider", price: 15, discount: "~40% OFF" },
];

const PricingPage = () => (
  <PageTransition>
    <PageHeader
      align="center"
      title="Flexible Rental Plans."
      subtitle="The longer you ride, the less you pay per day."
    />

    <div className={styles.grid}>
      {PRICING_TIERS.map((tier) => (
        <article key={tier.name} className={cx(styles.card, tier.isPopular && styles.popular)}>
          {tier.isPopular && <div className={styles.promoBadge}>Popular Choice</div>}

          <div className={styles.duration}>{tier.duration}</div>
          <div className={styles.tierName}>{tier.name}</div>

          <div className={styles.price}>
            <span className={styles.priceLabel}>Daily Rent</span>
            <div className={styles.amount}>
              {tier.price} <span className={styles.currency}>PLN/day</span>
            </div>
            {tier.discount && <Badge tone="success">{tier.discount}</Badge>}
          </div>

          {/* Pinned to the card's foot, so all three line up although only
              two carry a discount. */}
          <Button
            to="/rent-bike"
            variant={tier.isPopular ? "primary" : "secondary"}
            size="lg"
            block
            className={styles.cta}
          >
            Start Riding
          </Button>
        </article>
      ))}
    </div>

    <p className={styles.note}>
      Rental periods range from {MIN_RENTAL_DAYS} to {MAX_RENTAL_DAYS} days.
    </p>
  </PageTransition>
);

export default PricingPage;
