import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { apiFetch, toastError } from "../../api/client";
import { useCheckout } from "../../hooks/useCheckout";
import { findCatalogModel } from "../../data/fleetCatalog";
import { CITY_LABELS } from "../../data/cities";
import type { AvailabilityResponse, AvailableBikeModel, BikeModel } from "../../types/Fleet";
import type { RentalQuote } from "../../types/Pricing";
import { WizardStep } from "../../types/Wizard";
import { humanize } from "../../utils/format";
import PageTransition from "../../components/common/PageTransition";
import Redirect from "../../components/common/Redirect";
import Logo from "../../components/ui/Logo";
import PageLoader from "../../components/ui/PageLoader";
import StepDateSelection from "./components/StepDateSelection";
import StepBikeSelection from "./components/StepBikeSelection";
import StepSummary from "./components/StepSummary";
import styles from "./RentBikePage.module.scss";

// The API has no artwork; the marketing catalogue supplies it by model name.
// Every spec still comes from the API.
const toBikeModel = (apiBike: AvailableBikeModel): BikeModel => {
  const artwork = findCatalogModel(apiBike.modelName);
  return {
    id: apiBike.bookableInstanceId,
    name: apiBike.modelName,
    category: humanize(apiBike.modelCategory),
    description: apiBike.modelDescription,
    stats: {
      speed: apiBike.modelSpeed,
      range: apiBike.modelRange,
      capacity: apiBike.modelCapacity,
    },
    image: artwork?.image,
    imageEmoji: artwork?.imageEmoji,
  };
};

const RentBikePage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [step, setStep] = useState<WizardStep>(WizardStep.Dates);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [availableBikes, setAvailableBikes] = useState<BikeModel[]>([]);
  // Server-priced quote for the searched range. Cleared whenever the dates
  // change, so a stale price can never reach the summary.
  const [quote, setQuote] = useState<RentalQuote | null>(null);
  const [chosenBike, setChosenBike] = useState<BikeModel | null>(null);

  const { executeCheckout, isSubmitting } = useCheckout();
  const searchRef = useRef<AbortController | null>(null);

  if (!user) return <Redirect to="/login" />;
  const city = user.city;

  const handleDatesChange = (next: { start: string; end: string }) => {
    setDates(next);
    setQuote(null);
  };

  // Loads what is free for the chosen dates, cancelling any search still in
  // flight so an older answer cannot land on top of a newer one.
  const searchBikes = async () => {
    searchRef.current?.abort();
    const controller = new AbortController();
    searchRef.current = controller;
    setStep(WizardStep.Loading);

    try {
      const data = await apiFetch<AvailabilityResponse>("/api/v1/reservations/availability", {
        query: { startDate: dates.start, endDate: dates.end, city },
        signal: controller.signal,
      });
      setAvailableBikes(data.models.map(toBikeModel));
      setQuote(data.quote);
      setStep(WizardStep.BikeSelection);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Search failed:", error);
      toastError(error, "Failed to load available bikes.");
      setStep(WizardStep.Dates);
    }
  };

  const handleBook = (bike: BikeModel) => {
    setChosenBike(bike);
    setStep(WizardStep.Summary);
  };

  const handleConfirm = () => {
    if (!chosenBike) return;
    executeCheckout(chosenBike.id, dates, {
      onSuccess: () => navigate("/my-rentals"),
      // The bike went to someone else mid-booking: search again, so the rider
      // picks from what is actually still free.
      onConflict: searchBikes,
    });
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        <header className={styles.topBar}>
          <Logo />
          <Link to="/dashboard" className={styles.closeBtn} aria-label="Back to the dashboard">
            ✕
          </Link>
        </header>

        <main className={styles.wizard}>
          {step === WizardStep.Dates && (
            <StepDateSelection
              dates={dates}
              setDates={handleDatesChange}
              city={city}
              onSearch={searchBikes}
            />
          )}

          {step === WizardStep.Loading && (
            <PageLoader label={`Checking availability in ${CITY_LABELS[city]}…`} />
          )}

          {step === WizardStep.BikeSelection && (
            <StepBikeSelection
              bikes={availableBikes}
              city={city}
              onBack={() => setStep(WizardStep.Dates)}
              onBook={handleBook}
            />
          )}

          {step === WizardStep.Summary && chosenBike && quote && (
            <StepSummary
              bike={chosenBike}
              dates={dates}
              quote={quote}
              onBack={() => setStep(WizardStep.BikeSelection)}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default RentBikePage;
