import { SUPPORTED_CITIES, type City } from "../types/Fleet";

// How each API city enum is shown to people.
export const CITY_LABELS: Record<City, string> = {
  WARSAW: "Warsaw",
  GDANSK: "Gdańsk",
  POZNAN: "Poznań",
  WROCLAW: "Wrocław",
};

export const CITY_OPTIONS = SUPPORTED_CITIES.map((city) => ({
  value: city,
  label: CITY_LABELS[city],
}));

// Where a rider collects a bike in each city.
export const CITY_HUBS: Record<City, { address: string; hours: string }> = {
  WARSAW: {
    address: "VeloCity Hub Śródmieście, ul. Marszałkowska 10, 00-001 Warszawa",
    hours: "Mon–Sun, 7:00–22:00",
  },
  WROCLAW: {
    address: "VeloCity Hub Rynek, ul. Oławska 5, 50-123 Wrocław",
    hours: "Mon–Sun, 8:00–21:00",
  },
  POZNAN: {
    address: "VeloCity Hub Centrum, ul. Półwiejska 25, 61-888 Poznań",
    hours: "Mon–Sun, 8:00–21:00",
  },
  GDANSK: {
    address: "VeloCity Hub Główne Miasto, ul. Długa 30, 80-827 Gdańsk",
    hours: "Mon–Sun, 8:00–21:00",
  },
};
