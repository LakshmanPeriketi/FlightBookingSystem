import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchWidget from '../components/SearchWidget';
import FlightResults from '../components/FlightResults';
import Filters from '../components/Filters';
import { generateMockFlights } from '../utils/mockData';
import { FaPlaneDeparture, FaCalendarAlt } from 'react-icons/fa';
import '../pages/ProfilePage.css'; // Reuse profile card styles

const SearchDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Accept pre-filled data from "Repeat Journey"
  const repeatData = location.state?.repeatData;

  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [filters, setFilters] = useState({
    priceRange: [0, 2000],
    stops: 'any',
    airlines: []
  });

  const [sortBy, setSortBy] = useState('recommended');

  // Fetch recent bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/bookings/${user.id}`);
        // Show at most 3 recent bookings on dashboard
        setRecentBookings(response.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch recent bookings', err);
      } finally {
        setIsLoadingBookings(false);
      }
    };
    if (user?.id) fetchRecentBookings();
  }, [user]);

  const handleSearch = (params) => {
    setIsSearching(true);
    setHasSearched(true);
    
    setTimeout(() => {
      const results = generateMockFlights(params.source, params.destination, params.date);
      setFlights(results);
      setIsSearching(false);
    }, 1200);
  };

  useEffect(() => {
    let result = [...flights];

    result = result.filter(f => f.price >= filters.priceRange[0] && f.price <= filters.priceRange[1]);

    if (filters.stops !== 'any') {
      result = result.filter(f => f.stops === parseInt(filters.stops));
    }

    if (filters.airlines.length > 0) {
      result = result.filter(f => filters.airlines.includes(f.airline));
    }

    if (sortBy === 'cheapest') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      result.sort((a, b) => {
        const scoreA = a.price + (a.durationMinutes * 2) + (a.stops * 50);
        const scoreB = b.price + (b.durationMinutes * 2) + (b.stops * 50);
        return scoreA - scoreB;
      });
    }

    setFilteredFlights(result);
  }, [flights, filters, sortBy]);

  return (
    <div className="animate-fade-in">
      <section className="hero-section" style={{ padding: '2rem 0 1rem 0' }}>
        <div className="search-container">
          <SearchWidget onSearch={handleSearch} initialData={repeatData} />
        </div>
      </section>

      {/* Recent Bookings Section */}
      {!hasSearched && !isLoadingBookings && recentBookings.length > 0 && (
        <section className="dashboard-bookings" style={{ maxWidth: '1000px', margin: '0 auto 2rem auto', padding: '0 2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Your Recent Trips</h3>
          <div className="bookings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {recentBookings.map(booking => (
              <div key={booking.id} className="booking-card glass-card animate-fade-in">
                <div className="card-header">
                  <span className="airline"><FaPlaneDeparture /> {booking.airline}</span>
                  <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                </div>
                
                <div className="route">
                  <div className="city">{booking.source}</div>
                  <div className="arrow">→</div>
                  <div className="city">{booking.destination}</div>
                </div>

                <div className="details-row">
                  <div className="detail-item">
                    <FaCalendarAlt /> {booking.departure_time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasSearched ? (
        <section className="results-section animate-fade-in delay-100">
          <div className="results-layout">
            <aside className="filters-sidebar glass">
              <Filters 
                filters={filters} 
                onChange={setFilters} 
                availableAirlines={[...new Set(flights.map(f => f.airline))]} 
              />
            </aside>
            <div className="flights-main">
              <FlightResults 
                flights={filteredFlights} 
                isLoading={isSearching} 
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="empty-state" style={{ marginTop: recentBookings.length > 0 ? '2rem' : '4rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>Where will you go next?</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Enter your destination above to explore flights.</p>
        </div>
      )}
    </div>
  );
};

export default SearchDashboard;
