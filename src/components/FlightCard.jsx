import { useNavigate } from 'react-router-dom';
import { FaPlane, FaSuitcase, FaClock } from 'react-icons/fa';
import './FlightCard.css';

const FlightCard = ({ flight, style }) => {
  const navigate = useNavigate();

  return (
    <div className="flight-card glass-card animate-fade-in" style={style}>
      <div className="flight-main">
        <div className="airline-info">
          <div className="airline-logo">
            <FaPlane />
          </div>
          <div className="airline-details">
            <h4>{flight.airline}</h4>
            <span className="flight-number">{flight.id}</span>
          </div>
        </div>

        <div className="flight-times">
          <div className="time-col text-right">
            <h3>{flight.departureTime}</h3>
            <span className="city">{flight.source}</span>
          </div>

          <div className="duration-col">
            <span className="duration-text"><FaClock /> {flight.durationFormatted}</span>
            <div className="duration-line">
              <span className="dot"></span>
              <span className="line"></span>
              <span className="dot"></span>
            </div>
            <span className="stops-text">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="time-col">
            <h3>Arrival</h3>
            <span className="city">{flight.destination}</span>
          </div>
        </div>
      </div>

      <div className="flight-divider"></div>

      <div className="flight-price-action">
        <div className="price-info">
          <span className="price-label">Price per passenger</span>
          <h2 className="price-amount">{flight.currency}{flight.price}</h2>
          <span className="class-info"><FaSuitcase /> {flight.class}</span>
        </div>
        
        <button 
          className="glass-button book-btn"
          onClick={() => navigate(`/flight/${flight.id}`, { state: { flight } })}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
