import { useState, useEffect } from 'react';
import axios from 'axios';
import './SeatSelection.css';

const ROWS = 10;
const SEATS_PER_ROW = 6; // A B C | D E F
const FIRST_CLASS_ROWS = 2; // Rows 1-2

const SeatSelection = ({ flightId, selectedSeat, onSeatSelect }) => {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/flights/${flightId}/seats`);
        setBookedSeats(response.data);
      } catch (err) {
        setError('Failed to load seat availability.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();
  }, [flightId]);

  const generateSeatId = (row, colIndex) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `${row}${letters[colIndex]}`;
  };

  const getSeatClass = (seatId, row) => {
    if (bookedSeats.includes(seatId)) return 'seat booked';
    if (seatId === selectedSeat) return 'seat selected';
    if (row <= FIRST_CLASS_ROWS) return 'seat first-class available';
    return 'seat economy available';
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    onSeatSelect(seatId);
  };

  if (isLoading) return <div className="seat-loader"><div className="spinner"></div></div>;
  if (error) return <div className="auth-error">{error}</div>;

  return (
    <div className="seat-selection-container animate-fade-in">
      <div className="seat-legend">
        <div className="legend-item"><div className="seat-box available"></div> Available</div>
        <div className="legend-item"><div className="seat-box selected"></div> Selected</div>
        <div className="legend-item"><div className="seat-box booked"></div> Booked</div>
        <div className="legend-item"><div className="seat-box first-class"></div> First Class (Rows 1-2)</div>
      </div>

      <div className="airplane-fuselage">
        <div className="airplane-nose"></div>
        <div className="cabin">
          {Array.from({ length: ROWS }).map((_, rowIndex) => {
            const rowNumber = rowIndex + 1;
            return (
              <div key={rowNumber} className="seat-row">
                <div className="row-number">{rowNumber}</div>
                <div className="seat-group left">
                  {Array.from({ length: 3 }).map((_, colIndex) => {
                    const seatId = generateSeatId(rowNumber, colIndex);
                    return (
                      <button
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={bookedSeats.includes(seatId)}
                        title={`Seat ${seatId}`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle"></div>
                <div className="seat-group right">
                  {Array.from({ length: 3 }).map((_, colIndex) => {
                    const seatId = generateSeatId(rowNumber, colIndex + 3);
                    return (
                      <button
                        key={seatId}
                        className={getSeatClass(seatId, rowNumber)}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={bookedSeats.includes(seatId)}
                        title={`Seat ${seatId}`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="airplane-tail"></div>
      </div>
    </div>
  );
};

export default SeatSelection;
