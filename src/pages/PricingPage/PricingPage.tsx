import PageTransition from "../../components/common/PageTransition";
import LandingBtn from "../../components/LandingBtn/LandingBtn";
import styles from "./PricingPage.module.scss";

interface PricingTier {
  id: string;
  duration: string;
  name: string;
  price: number;
  discount?: string;
  deposit: number;
  isPopular?: boolean;
  isPrimaryButton: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "short-term",
    duration: "3 - 7 Days",
    name: "Weekender",
    price: 25,
    deposit: 200,
    isPrimaryButton: false,
  },
  {
    id: "medium-term",
    duration: "8 - 14 Days",
    name: "Rider",
    price: 20,
    discount: "~20% OFF",
    deposit: 200,
    isPopular: true,
    isPrimaryButton: true,
  },
  {
    id: "long-term",
    duration: "15 - 21 Days",
    name: "Pro Rider",
    price: 15,
    discount: "~40% OFF",
    deposit: 200,
    isPrimaryButton: false,
  },
];

const PricingPage = () => {
  // Enterprise currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <PageTransition>
      <div className={styles.pricingPage}>
        <header className={styles.header}>
          <h1>Flexible Rental Plans.</h1>
          <p>The longer you ride, the less you pay per day.</p>
        </header>

        <div className={styles.pricingGrid}>
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`${styles.card} ${tier.isPopular ? styles.popular : ""}`}
            >
              {tier.isPopular && (
                <div className={styles.promoBadge}>Popular Choice</div>
              )}

              <div className={styles.durationBadge}>{tier.duration}</div>
              <div className={styles.tierName}>{tier.name}</div>

              <div className={styles.priceContainer}>
                <span className={styles.label}>Daily Rent</span>
                <div className={styles.priceRange}>
                  {tier.price} <span className={styles.currency}>PLN/day</span>
                </div>
                {tier.discount && (
                  <span className={styles.discountTag}>{tier.discount}</span>
                )}
              </div>

              <div className={styles.depositInfo}>
                Security Deposit:{" "}
                <strong>{formatCurrency(tier.deposit)}</strong>
              </div>

              <LandingBtn primary={tier.isPrimaryButton} />
            </article>
          ))}
        </div>

        <footer className={styles.note}>
          <p>
            * Security deposit is required and refunded upon bike return in good
            condition.
            <br />
            Rental periods range from 3 to 21 days.
          </p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default PricingPage;
