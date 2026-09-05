import { WizardStep } from "../../../types/Wizard";
import styles from "../RentBikePage.module.scss";

interface Props {
  setStep: (step: WizardStep) => void;
  onSubmit: (e: React.FormEvent) => void;
  paymentStatus: "idle" | "processing" | "success" | "error";
  price: number;
}

export default function StepPayment({
  setStep,
  onSubmit,
  paymentStatus,
  price,
}: Props) {
  // Enterprise currency formatting
  const formattedPrice = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);

  const isProcessingOrSuccess =
    paymentStatus === "processing" || paymentStatus === "success";

  return (
    <div className={styles.stepContainer}>
      <button
        onClick={() => setStep(WizardStep.Summary)}
        className={styles.backBtn}
        disabled={isProcessingOrSuccess}
      >
        ← Back to Summary
      </button>

      <h1>Secure Checkout</h1>
      <p className={styles.subtitle}>Enter your card details to finalize.</p>

      <form onSubmit={onSubmit} className={styles.paymentForm}>
        {/* CARD UI */}
        <div className={styles.cardContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="ccName">Cardholder Name</label>
            <input
              id="ccName"
              type="text"
              autoComplete="cc-name" // Enables browser autofill
              placeholder="John Doe"
              required
              disabled={paymentStatus === "processing"}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="ccNumber">Card Number</label>
            <input
              id="ccNumber"
              type="text"
              inputMode="numeric" // Opens numpad on mobile
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
              disabled={paymentStatus === "processing"}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="ccExpiry">Expiry</label>
              <input
                id="ccExpiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                maxLength={5}
                required
                disabled={paymentStatus === "processing"}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="ccCvc">CVC</label>
              <input
                id="ccCvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4} // Some AMEX cards use 4 digits
                required
                disabled={paymentStatus === "processing"}
              />
            </div>
          </div>
        </div>

        {/* STATUS MESSAGES - added role="alert" for screen readers */}
        {paymentStatus === "error" && (
          <div className={styles.errorBanner} role="alert">
            Transaction declined. Bank rejected the operation.
          </div>
        )}

        {paymentStatus === "success" && (
          <div className={styles.successBanner} role="alert">
            Payment Successful! Redirecting...
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          type="submit"
          className={styles.payBtn}
          disabled={isProcessingOrSuccess}
        >
          {paymentStatus === "processing" ? (
            <span className={styles.miniSpinner} aria-label="Processing payment"></span>
          ) : (
            `Pay ${formattedPrice}`
          )}
        </button>
      </form>
    </div>
  );
}