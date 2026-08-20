import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaPlaneDeparture, FaCheckCircle, FaTimesCircle, FaChartLine, FaDollarSign } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Basic protection - if no user or not admin, bounce them
    if (!user || user.is_admin === false) {
      navigate('/home');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/admin/bookings?adminId=${user.id}`);
        setAllBookings(response.data);
      } catch (err) {
        setError('Failed to fetch platform bookings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/bookings/${bookingId}/status`, {
        adminId: user.id,
        status: newStatus
      });
      // Update local state without refetching the whole list
      setAllBookings(prevBookings => 
        prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  if (isLoading) return <div className="admin-loader"><div className="spinner"></div></div>;

  // Calculate some basic stats
  const totalRevenue = allBookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.price, 0);
  
  const activeBookings = allBookings.filter(b => b.status === 'Confirmed').length;

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header glass">
        <div className="admin-title">
          <FaUserShield className="admin-icon" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform Overview & Booking Management</p>
          </div>
        </div>
        <div className="admin-stats">
          <div className="stat-card">
            <FaChartLine className="stat-icon text-blue" />
            <div className="stat-info">
              <span className="stat-label">Active Bookings</span>
              <span className="stat-value">{activeBookings}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaDollarSign className="stat-icon text-green" />
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="auth-error">{error}</div>
      ) : (
        <div className="admin-content glass">
          <h2 className="section-title">All Platform Bookings</h2>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Flight</th>
                  <th>Seat</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(booking => (
                  <tr key={booking.id}>
                    <td className="text-muted">#{booking.id}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{booking.user_name}</strong>
                        <span className="text-muted text-sm">{booking.user_email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="route-sm">
                        <span>{booking.source}</span>
                        <span className="arrow">→</span>
                        <span>{booking.destination}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flight-sm">
                        <FaPlaneDeparture className="text-muted" /> {booking.airline}
                      </div>
                      <div className="text-muted text-sm">{booking.departure_time}</div>
                    </td>
                    <td><span className="seat-badge">{booking.seat_number}</span></td>
                    <td className="font-bold text-blue">${booking.price}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {booking.status !== 'Confirmed' && (
                          <button 
                            className="action-btn confirm"
                            onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                            title="Confirm Booking"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {booking.status !== 'Cancelled' && (
                          <button 
                            className="action-btn cancel"
                            onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                            title="Cancel Booking"
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {allBookings.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted">No bookings found on the platform.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
