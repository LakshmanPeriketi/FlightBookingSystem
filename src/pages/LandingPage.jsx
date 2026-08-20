import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-content glass">
        <h1 className="hero-title">Experience the Sky, Elevated.</h1>
        <p className="hero-subtitle">
          Join AeroBook today and discover premium flight options tailored perfectly to your schedule.
        </p>
        
        <div className="landing-actions">
          <Link to="/auth?mode=login" className="glass-button secondary">
            Log In to Account
          </Link>
          <Link to="/auth?mode=register" className="glass-button primary">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
