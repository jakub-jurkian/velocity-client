import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { useAppSelector } from "../../store/hooks";
import type {
  AvailabilityResponse,
  AvailableBikeModel,
  BikeInstance,
  BikeModel,
} from "../../types/Fleet";
import type { RentalQuote } from "../../types/Pricing";
import StepDateSelection from "./components/StepDateSelection";
import StepLoading from "./components/StepLoading";
import StepBikeSelection from "./components/StepBikeSelection";
import StepSummary from "./components/StepSummary";
import PageTransition from "../../components/common/PageTransition";
import styles from "./RentBikePage.module.scss";
import { useCheckout } from "../../hooks/useCheckout";
import Redirect from "../../components/common/Redirect";
import { WizardStep } from "../../types/Wizard";

/**
 * Rental length using the backend's exclusive-end convention, matching
 * ChronoUnit.DAYS.between(startDate, endDate) in ReservationService.
 * Sep 10 -> Sep 15 is 5 days. parseISO keeps 'YYYY-MM-DD' timezone-safe.
 *
 * Used only to pre-validate the 3..21 day window before calling the API.
 * It is deliberately NOT used to price anything — the server returns the quote.
 */
const getRentalDays = (start: string, end: string) => {
  return differenceInCalendarDays(parseISO(end), parseISO(start));
};

const formatCategory = (category: string) => {
  const words = category.toLowerCase().split("_");
  return words.join(" ").replace(/^[a-z]/, (letter) => letter.toUpperCase());
};

const MIN_RENTAL_DAYS = 3;
const MAX_RENTAL_DAYS = 21;

const RentBikePage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const jwtToken = useAppSelector((state) => state.auth.token);

  // Wizard State (Starts at Step 1: Dates)
  const [step, setStep] = useState<WizardStep>(WizardStep.Dates);
  const [dates, setDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [availableBikes, setAvailableBikes] = useState<BikeModel[]>([]);
  // Server-priced quote for the searched date range. Null until a search
  // succeeds, and cleared whenever the dates change so a stale price can
  // never reach the summary or payment step.
  const [quote, setQuote] = useState<RentalQuote | null>(null);
  const [chosenBike, setChosenBike] = useState<BikeInstance | null>(null);
  const [chosenBikeModel, setChosenBikeModel] = useState<BikeModel | null>(
    null,
  );

  // 1. Initialize our custom hook
  const { executeCheckout, isSubmitting } = useCheckout(jwtToken);

  // 2. Create a ref to store the current AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // If Redux hasn't loaded the user yet (e.g., hard refresh),
  // or they somehow bypassed the protected route, stop rendering.
  if (!user || !jwtToken) {
    return <Redirect to="/login" />;
  }
  const userCity = user.city;

  // Any date edit invalidates the server quote, so it can never be shown
  // against a range it was not priced for.
  const handleDatesChange = (newDates: { start: string; end: string }) => {
    setDates(newDates);
    setQuote(null);
  };

  // Step 1 - dates
  const handleBikeSearch = async (
    e: React.FormEvent,
    setError: (msg: string) => void,
  ) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!dates.start || !dates.end) {
      setError("Please select both dates.");
      return;
    }

    // Compare strings (YYYY-MM-DD) safely
    if (dates.end < dates.start) {
      setError("End date cannot be before start date.");
      return;
    }

    // Mirrors @Future on ReservationBookRequest.startDate. The picker's `min`
    // is only a hint, and a typed date can bypass it, so re-check here rather
    // than letting the user reach the summary before the API refuses.
    if (dates.start <= format(new Date(), "yyyy-MM-dd")) {
      setError("Bookings must start from tomorrow onwards.");
      return;
    }

    // Exclusive-end, timezone-safe day count (matches the backend)
    const diffDays = getRentalDays(dates.start, dates.end);

    if (diffDays < MIN_RENTAL_DAYS) {
      setError(`Minimum rental period is ${MIN_RENTAL_DAYS} days.`);
      return;
    }

    if (diffDays > MAX_RENTAL_DAYS) {
      setError(`Maximum rental period is ${MAX_RENTAL_DAYS} days.`);
      return;
    }

    // Cancel any previous pending request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create a new controller for this specific request
    abortControllerRef.current = new AbortController();

    try {
      // Move to loading
      setStep(WizardStep.Loading);
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = new URL(`${apiUrl}/api/v1/reservations/availability`);
      url.searchParams.append("startDate", dates.start);
      url.searchParams.append("endDate", dates.end);
      url.searchParams.append("city", userCity);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available bikes");
      }

      // { quote, models } — the quote is priced server-side for these dates.
      const data: AvailabilityResponse = await response.json();

      const mappedCatalog: BikeModel[] = data.models.map(
        (apiBike: AvailableBikeModel) => ({
          id: apiBike.bookableInstanceId,
          name: apiBike.modelName,
          category: formatCategory(apiBike.modelCategory),
          description: apiBike.modelDescription,
          stats: {
            speed: apiBike.modelSpeed,
            range: apiBike.modelRange,
            capacity: apiBike.modelCapacity,
          },
        }),
      );

      setAvailableBikes(mappedCatalog);
      setQuote(data.quote);
      setStep(WizardStep.BikeSelection);
    } catch (error: unknown) {
      // Ignore errors caused by our intentional abort
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Previous search request aborted.");
        return;
      }

      console.error("Search failed:", error);
      toast.error("Failed to load available bikes.");
      setStep(WizardStep.Dates); // Kick back to step 1 so they aren't stuck loading
    }
  };

  const handleBook = (instanceId: string) => {
    // Get raw reservations
    const selectedUiModel = availableBikes.find((b) => b.id === instanceId);
    if (!selectedUiModel) return;

    // Build the physical instance object for the payment payload
    const selectedInstance: BikeInstance = {
      id: instanceId, // The real UUID from the backend
      modelId: "resolved-by-backend",
      city: userCity,
      status: "ACTIVE",
    };

    // Update state and advance to Summary
    setChosenBike(selectedInstance);
    setChosenBikeModel(selectedUiModel);
    setStep(WizardStep.Summary);
  };

  const handleFinalConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenBike) return;

    // Call the hook, passing callbacks for navigation routing
    executeCheckout(
      chosenBike.id,
      dates.start,
      dates.end,
      () => navigate("/my-rentals"), // onSuccess
      () => setStep(WizardStep.Loading), // onConflict (reverts to search)
    );
  };

  return (
    <PageTransition>
      <div className={styles.rentBikePage}>
        <div className={styles.container}>
          <header className={styles.topBar}>
            <div className={styles.logo}>
              Velo<span className={styles.highlight}>City</span>
            </div>
            <Link to="/dashboard" className={styles.closeBtn}>
              ✕
            </Link>
          </header>

          <main className={styles.wizardContent}>
            {/* --- STEP 1: DATE SELECTION --- */}
            {step === WizardStep.Dates && (
              <StepDateSelection
                dates={dates}
                setDates={handleDatesChange}
                city={userCity}
                onSubmit={handleBikeSearch}
              />
            )}

            {/* --- STEP 2: LOADING --- */}
            {step === WizardStep.Loading && <StepLoading city={userCity} />}

            {/* --- STEP 3: RESULTS --- */}
            {step === WizardStep.BikeSelection && (
              <StepBikeSelection
                availableBikes={availableBikes}
                setStep={setStep}
                onBookBike={handleBook}
                city={userCity}
              />
            )}
            {/* --- STEP 4: SUMMARY & CONFIRM --- */}
            {step === WizardStep.Summary && chosenBikeModel && quote && (
              <StepSummary
                setStep={setStep}
                chosenBikeModel={chosenBikeModel}
                dates={dates}
                quote={quote}
                onConfirm={handleFinalConfirmation}
                isSubmitting={isSubmitting}
              />
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default RentBikePage;
