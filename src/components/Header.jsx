import { Link, useNavigate } from 'react-router-dom';
import { FaPlaneDeparture, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <Link to={user ? "/home" : "/"} className="logo">
        <FaPlaneDeparture className="logo-icon" />
        <span>AeroBook</span>
      </Link>
      
      {user && (
        <div className="nav-links"> {/* Changed from <nav> to <div> */}
          {user.is_admin && (
             <Link to="/admin" className="nav-link admin-link" style={{color: 'var(--accent-pink)'}}>Admin Dashboard</Link>
          )}
          <Link to="/home" className="nav-link">Flights</Link> {/* Kept existing Flights link */}
          <Link to="/profile" className="nav-link">My Bookings</Link> {/* Kept existing My Bookings link */}
        </div>
      )}

      <div className="user-actions">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <FaUser /> {user.name}
            </Link>
            <button className="glass-button secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/auth?mode=login" className="glass-button" style={{ background: 'transparent', boxShadow: 'none', textDecoration: 'none' }}>
              Log In
            </Link>
            <Link to="/auth?mode=register" className="glass-button" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
