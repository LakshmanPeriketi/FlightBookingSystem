import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaPlane, FaCheckCircle, FaChair, FaSuitcase, FaClock } from 'react-icons/fa';
import SeatSelection from '../components/SeatSelection';
import PaymentGateway from '../components/PaymentGateway';
import './FlightDetailsPage.css';

const FlightDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const flight = location.state?.flight;

  const [step, setStep] = useState(1); // 1: Details, 2: Seats, 3: Payment
  const [selectedSeat, setSelectedSeat] = useState(null);
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!flight) {
    return (
      <div className="details-container text-center">
        <h2>Flight not found</h2>
        <button className="glass-button mt-4" onClick={() => navigate('/home')}>Return to Search</button>
      </div>
    );
  }

  const handleFinalBooking = async () => {
    setIsBooking(true);
    setError('');

    try {
      await axios.post('http://localhost:3001/api/bookings', {
        user_id: user.id,
        flight_id: flight.id,
        airline: flight.airline,
        source: flight.source,
        destination: flight.destination,
        departure_time: flight.departureTime,
        price: flight.price,
        seat_number: selectedSeat,
        payment_status: 'Paid'
      });

      setBookingSuccess(true);
    } catch (err) {
      if (err.response?.status === 409) {
         setError('Sorry, this seat was just booked by someone else! Please choose another.');
         setStep(2); // Go back to seat selection
      } else {
         setError('Failed to book flight. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="details-container">
        <div className="booking-success glass animate-scale-in">
          <FaCheckCircle className="success-icon" />
          <h2>Booking Confirmed!</h2>
          <p>Your flight to {flight.destination} is set. Seat: {selectedSeat}</p>
          <div className="mt-4 flex-center gap-4" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button className="glass-button secondary" onClick={() => navigate('/home')}>Book Another</button>
            <button className="glass-button" onClick={() => navigate('/profile')}>View My Trips</button>
          </div>
        </div>
      </div>
    );
  }

  // --- WIZARD STEPS RENDERING ---

  return (
    <div className="details-container animate-fade-in">
      {step === 1 && (
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Results
        </button>
      )}

      {/* Progress Indicator */}
      <div className="booking-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Review Itinerary</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Select Seat</div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div className="details-card glass">
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="details-header">
              <div className="airline-badge">
                <FaPlane /> {flight.airline}
              </div>
              <div className="flight-id">Flight {flight.id}</div>
            </div>

            <div className="flight-route">
              <div className="route-point left">
                <h2>{flight.source}</h2>
                <div className="time">{flight.departureTime}</div>
                <div className="date">Date Selected</div>
              </div>
              
              <div className="route-duration">
                <span style={{ color: 'var(--text-muted)' }}>{flight.durationFormatted}</span>
                <div className="route-line">
                  <span className="dot"></span>
                  <span className="line"></span>
                  <span className="dot"></span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop(s)`}
                </span>
              </div>

              <div className="route-point right">
                <h2>{flight.destination}</h2>
                <div className="time">Arrival Time</div>
                <div className="date">Date Selected</div>
              </div>
            </div>

            <div className="details-divider"></div>

            <div className="flight-info-grid">
              <div className="info-item">
                <span className="label">Cabin Class</span>
                <span className="value"><FaChair /> {flight.class}</span>
              </div>
              <div className="info-item">
                <span className="label">Baggage</span>
                <span className="value"><FaSuitcase /> 1 Checked, 1 Cabin</span>
              </div>
              <div className="info-item">
                <span className="label">Aircraft</span>
                <span className="value"><FaPlane /> Boeing 787</span>
              </div>
            </div>

            <div className="booking-section">
              <div className="price-total">
                <span className="label">Total Price (1 Passenger)</span>
                <h2>{flight.currency}{flight.price}</h2>
              </div>
              <button 
                className="glass-button book-btn-large" 
                onClick={() => setStep(2)}
              >
                Continue to Seats
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
             <div className="details-header" style={{ marginBottom: '1rem' }}>
               <h3>Choose Your Seat</h3>
               <button className="glass-button secondary sm-btn" onClick={() => setStep(1)}>Go Back</button>
             </div>
             <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
               You have selected to fly with {flight.airline}. Please select an available seat.
             </p>
             
             <SeatSelection 
                flightId={flight.id} 
                selectedSeat={selectedSeat}
                onSeatSelect={setSelectedSeat}
             />

             <div className="booking-section" style={{ marginTop: '3rem' }}>
              <div className="price-total">
                <span className="label">Selected Seat</span>
                <h2>{selectedSeat || 'None'}</h2>
              </div>
              <button 
                className="glass-button book-btn-large" 
                disabled={!selectedSeat}
                onClick={() => setStep(3)}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
             <PaymentGateway 
                amount={flight.price} 
                onPaymentSuccess={handleFinalBooking} 
                onBack={() => setStep(2)} 
             />
             {isBooking && (
               <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                 Finalizing your reservation...
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FlightDetailsPage;
