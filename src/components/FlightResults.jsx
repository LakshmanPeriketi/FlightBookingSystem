import FlightCard from './FlightCard';
import './FlightResults.css';
import { FaSortAmountDown } from 'react-icons/fa';

const FlightResults = ({ flights, isLoading, sortBy, onSortChange }) => {

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Searching best flights for you...</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="empty-state glass">
        <h3>No flights found</h3>
        <p>Try adjusting your search criteria to see more results.</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header glass">
        <h2>{flights.length} flights found</h2>
        
        <div className="sort-controls">
          <FaSortAmountDown className="sort-icon" />
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="glass-input sort-select"
          >
            <option value="recommended">Recommended</option>
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
          </select>
        </div>
      </div>

      <div className="flights-list">
        {flights.map((flight, index) => (
          <FlightCard 
            key={flight.id} 
            flight={flight} 
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default FlightResults;
