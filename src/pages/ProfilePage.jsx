import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlaneDeparture, FaCalendarAlt, FaHistory, FaUserEdit, FaLock, FaRedo } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history'); // history, details, password
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // History State
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Details State
  const [detailsForm, setDetailsForm] = useState({ name: user?.name || '', email: user?.email || '' });

  // Password State
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  useEffect(() => {
    // Clear messages on tab change
    setSuccessMsg('');
    setErrorMsg('');
  }, [activeTab]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (activeTab !== 'history') return;
      setIsLoadingBookings(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/bookings/${user.id}`);
        setBookings(response.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    if (user?.id) fetchBookings();
  }, [user, activeTab]);

  const handleDetailsChange = (e) => setDetailsForm({ ...detailsForm, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.put('http://localhost:3001/api/auth/update-details', {
        userId: user.id,
        name: detailsForm.name,
        email: detailsForm.email
      });
      updateUser({ name: detailsForm.name, email: detailsForm.email });
      setSuccessMsg(response.data.message);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || `Failed to update: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put('http://localhost:3001/api/auth/update-password', {
        userId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccessMsg(response.data.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || `Failed to update password: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepeatJourney = (booking) => {
    navigate('/home', {
      state: {
        repeatData: {
          source: booking.source,
          destination: booking.destination
        }
      }
    });
  };

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-content glass">
        <div className="tabs-sidebar">
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory /> Booking History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FaUserEdit /> Account Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock /> Change Password
          </button>
        </div>

        <div className="tab-panel">
          {errorMsg && <div className="auth-error mb-4">{errorMsg}</div>}
          {successMsg && <div className="auth-success mb-4">{successMsg}</div>}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h2 className="section-title">My Bookings</h2>
              
              {isLoadingBookings ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your trips...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">
                  <h3>No Bookings Found</h3>
                  <p>You haven't booked any flights yet.</p>
                </div>
              ) : (
                <div className="bookings-grid">
                  {bookings.map(booking => (
                    <div key={booking.id} className="booking-card glass-card">
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
                        <div className="price">${booking.price}</div>
                      </div>
                      
                      <div className="card-footer">
                        <div className="booking-ref">Ref: {booking.flight_id}</div>
                        <button 
                          className="glass-button secondary sm-btn"
                          title="Repeat this journey"
                          onClick={() => handleRepeatJourney(booking)}
                        >
                          <FaRedo /> Repeat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-tab">
              <h2 className="section-title">Account Details</h2>
              <form onSubmit={handleUpdateDetails} className="profile-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className="glass-input" 
                    value={detailsForm.name}
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="glass-input" 
                    value={detailsForm.email}
                    onChange={handleDetailsChange}
                    disabled
                    readOnly
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    title="Email cannot be changed"
                  />
                </div>
                <button type="submit" className="glass-button mt-4" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-tab">
              <h2 className="section-title">Change Password</h2>
              <form onSubmit={handleUpdatePassword} className="profile-form">
                <div className="input-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    className="glass-input" 
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    className="glass-input" 
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmNewPassword" 
                    className="glass-input" 
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <button type="submit" className="glass-button mt-4" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
