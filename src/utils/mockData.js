import { addDays, format } from 'date-fns';

const AIRLINES = ['Skyward Airlines', 'AeroGlobal', 'Oceanic Flights', 'Zenith Air', 'Horizon Jet'];
const CITIES = ['New York', 'London', 'Tokyo', 'Paris', 'Dubai', 'Singapore', 'Los Angeles', 'Mumbai'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateMockFlights = (source, dest, date) => {
  const flightCount = getRandomInt(10, 25);
  const flights = [];

  for (let i = 0; i < flightCount; i++) {
    const isDirect = Math.random() > 0.4;
    const stops = isDirect ? 0 : getRandomInt(1, 2);
    
    // Base duration in minutes (e.g., 2h to 14h)
    const baseDuration = getRandomInt(120, 840);
    const totalDuration = baseDuration + (stops * getRandomInt(45, 120)); // Add layover times

    // Base price
    const basePrice = getRandomInt(150, 1200);
    const price = isDirect ? basePrice + 100 : basePrice; // Direct flights usually cost more

    const departureHour = getRandomInt(0, 23);
    const departureMin = getRandomElement([0, 15, 30, 45]);
    
    // Set explicit dummy times for simplicity in UI rendering
    const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMin.toString().padStart(2, '0')}`;
    
    const durationHours = Math.floor(totalDuration / 60);
    const durationMins = totalDuration % 60;
    
    flights.push({
      id: `FL-${getRandomInt(1000, 9999)}`,
      airline: getRandomElement(AIRLINES),
      source: source || getRandomElement(CITIES),
      destination: dest || getRandomElement(CITIES),
      departureDate: date || format(new Date(), 'yyyy-MM-dd'),
      departureTime,
      durationMinutes: totalDuration,
      durationFormatted: `${durationHours}h ${durationMins}m`,
      stops,
      price,
      currency: '$',
      class: getRandomElement(['Economy', 'Business', 'First']),
      seatsAvailable: getRandomInt(1, 40)
    });
  }

  return flights;
};
