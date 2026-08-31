import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { processPayment } from "../../utils/paymentHelper";
import { getDynamicPrice, getRentalDays } from "../../utils/rentalCalculations";
import type { BikeInstance, BikeModel } from "../../types/Fleet";
import StepDateSelection from "./components/StepDateSelection";
import StepLoading from "./components/StepLoading";
import StepBikeSelection from "./components/StepBikeSelection";
import StepSummary from "./components/StepSummary";
import StepPayment from "./components/StepPayment";
import PageTransition from "../../components/common/PageTransition";
import styles from "./RentBikePage.module.scss";
import toast from "react-hot-toast";

// Timezone-safe, inclusive day diff for YYYY-MM-DD (e.g., 29→31 = 3 days)
const getInclusiveDays = (start: string, end: string) => {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const startUTC = Date.UTC(sy, sm - 1, sd);
  const endUTC = Date.UTC(ey, em - 1, ed);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endUTC - startUTC) / msPerDay) + 1;
};

const RentBikePage = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const userCity = user!.city;
  // Wizard State (Starts at Step 1: Dates)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [dates, setDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [availableBikes, setAvailableBikes] = useState<BikeModel[]>([]);
  const [chosenBike, setChosenBike] = useState<BikeInstance | null>(null);
  const [chosenBikeModel, setChosenBikeModel] = useState<BikeModel | null>(
    null,
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  // Step 1 - dates
  const handleBikeSearch = (
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

    // Inclusive, timezone-safe day count
    const diffDays = getInclusiveDays(dates.start, dates.end);

    if (diffDays < 3) {
      setError("Minimum rental period is 3 days.");
      return;
    }

    if (diffDays > 21) {
      setError("Maximum rental period is 21 days.");
      return;
    }

    // Move to loading
    setStep(2);
  };

  // Step 2 - simulate API call
  useEffect(() => {
    if (step !== 2 || !dates.start || !dates.end) return;

    const fetchActiveBikes = async () => {
      try {
        const jwtToken = localStorage.getItem("velocity_jwt");
        if (!jwtToken) return;

        const url = new URL(
          "http://localhost:8080/api/v1/reservations/availability",
        );
        url.searchParams.append("startDate", dates.start);
        url.searchParams.append("endDate", dates.end);
        url.searchParams.append("city", userCity);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Convert flat backend DTO to nested UI Model

          type ApiBike = {
            bookableInstanceId: string;
            modelName: string;
            modelCategory: string;
            modelDescription: string;
            modelSpeed: string;
            modelRange: string;
            modelCapacity: string;
          };

          const mappedCatalog: BikeModel[] = data.map((apiBike: ApiBike) => ({
            id: apiBike.bookableInstanceId,
            name: apiBike.modelName,
            category: apiBike.modelCategory,
            description: apiBike.modelDescription,
            stats: {
              speed: apiBike.modelSpeed,
              range: apiBike.modelRange,
              capacity: apiBike.modelCapacity,
            },
            imageEmoji: "🚲", // Fallback emoji
          }));

          setAvailableBikes(mappedCatalog);
          setStep(3);
        }
      } catch (error) {
        console.error("Failed to fetch active bikes:", error);
      }
    };

    fetchActiveBikes();
  }, [step, userCity, dates]);

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
    setStep(4);
  };

  const handleProceedToPayment = () => {
    setPaymentStatus("idle"); // Reset payment state
    setStep(5);
  };

  const handleFinalPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    setPaymentStatus("processing"); // STATE: WAITING

    try {
      // ASYNC SIMULATION (The Requirement)
      await processPayment();

      // STATE: SUCCESS
      setPaymentStatus("success");

      const jwtToken = localStorage.getItem("velocity_jwt");
      const response = await fetch(
        "http://localhost:8080/api/v1/reservations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "Application/json",
          },
          body: JSON.stringify({
            bikeInstanceId: chosenBike!.id,
            startDate: dates.start,
            endDate: dates.end,
          }),
        },
      );
      if (response.status === 409) {
        toast.error(
          "Concurrent booking conflict: This bike was just reserved. Please select another",
        );
        setStep(2);
        return;
      }
      //returns {id, startDate, endDate, totalCost, status, createdAt, bike: {id, name}}
      navigate("/my-rentals");
      toast.success("Reservation booked successfully!");
      const data = await response.json();
      // const res = await fetch(
      //   `http://localhost:8080/api/v1/reservations/${data.id}/confirm`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${jwtToken}`,
      //     },
      //   },
      // );
      // if (res.ok) {
      //   navigate("/my-rentals");
      //   toast.success("Reservation booked successfully!");
      // } else {
      //   toast.error("Finalizing the reservation failed.");
      //   setPaymentStatus("error");
      // }
    } catch (error) {
      console.log(error);
      // STATE: REJECTION
      setPaymentStatus("error");
    }
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
            {step === 1 && (
              <StepDateSelection
                dates={dates}
                setDates={setDates}
                city={userCity}
                onSubmit={handleBikeSearch}
              />
            )}

            {/* --- STEP 2: LOADING --- */}
            {step === 2 && <StepLoading city={userCity} />}

            {/* --- STEP 3: RESULTS --- */}
            {step === 3 && (
              <StepBikeSelection
                availableBikes={availableBikes}
                setStep={setStep}
                onClick={handleBook}
                city={userCity}
              />
            )}
            {/* --- STEP 4: SUMMARY & CONFIRM --- */}
            {step === 4 && chosenBikeModel && (
              <StepSummary
                setStep={setStep}
                chosenBikeModel={chosenBikeModel}
                dates={dates}
                onClick={handleProceedToPayment}
              />
            )}
            {/* --- STEP 5: PAYMENT PROCESS --- */}
            {step === 5 && chosenBikeModel && (
              <StepPayment
                setStep={setStep}
                onSubmit={handleFinalPayment}
                paymentStatus={paymentStatus}
                price={getDynamicPrice(getRentalDays(dates)).total}
              />
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default RentBikePage;
