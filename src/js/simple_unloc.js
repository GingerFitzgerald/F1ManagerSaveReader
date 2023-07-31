export const getDriverCode = (loc) => {
  return loc.replace("[DriverCode_", "").replace("]", "").toUpperCase();
}

export const weekendStages = [
  "Day 1",
  "Practice 1",
  "Practice 2",
  "Day 2",
  "Practice 3",
  "Qualifying 1",
  "Qualifying 2",
  "Qualifying 3",
  "Day 3",
  "Race",
  "Race End",
  "Race End",
  "Race End",
]
export const circuitNames = [
  "Unknown",
  "Melbourne",
  "Sakhir",
  "Shanghai",
  "Baku",
  "Barcelona",
  "Monte Carlo",
  "Montréal",
  "Le Castellet",
  "Spielberg",

  "Silverstone",
  "Jeddah",
  "Budapest",
  "Spa-Francorchamps",
  "Monza",
  "Singapore",
  "Sochi",
  "Suzuka",
  "Mexico City",
  "Austin",

  "São Paulo",
  "Yas Island",
  "Miami Gardens",
  "Zandvoort",
  "Imola",

  "Las Vegas",
  "Losail",
]
export const countryNames = [
  "Unknown",
  "Australia",
  "Bahrain",
  "China",
  "Azerbaijan",
  "Spain",
  "Monaco",
  "Canada",
  "France",
  "Austria",

  "Great Britain",
  "Saudi Arabia",
  "Hungary",
  "Belgium",
  "Italy",
  "Singapore",
  "Russia",
  "Japan",
  "Mexico",
  "United States",

  "Brazil",
  "Abu Dhabi",
  "United States",
  "Netherlands",
  "Italy",

  "United States",
  "Qatar",
]