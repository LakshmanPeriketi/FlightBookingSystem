import { useState, useEffect } from 'react';
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUser, FaSearch } from 'react-icons/fa';
import './SearchWidget.css';

const SearchWidget = ({ onSearch, initialData }) => {
  const [params, setParams] = useState({
    source: initialData?.source || '',
    destination: initialData?.destination || '',
    date: '',
    passengers: 1
  });

  useEffect(() => {
    if (initialData) {
      setParams(prev => ({
        ...prev,
        source: initialData.source || prev.source,
        destination: initialData.destination || prev.destination
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(params);
  };

  return (
    <form className="search-widget glass" onSubmit={handleSubmit}>
      <div className="input-group">
        <label><FaPlaneDeparture /> From</label>
        <input 
          type="text" 
          name="source" 
          className="glass-input" 
          placeholder="Where from?" 
          value={params.source} 
          onChange={handleChange} 
          required
        />
      </div>
      
      <div className="input-divider" />
      
      <div className="input-group">
        <label><FaPlaneArrival /> To</label>
        <input 
          type="text" 
          name="destination" 
          className="glass-input" 
          placeholder="Where to?" 
          value={params.destination} 
          onChange={handleChange} 
          required
        />
      </div>
      
      <div className="input-divider" />
      
      <div className="input-group">
        <label><FaCalendarAlt /> Date</label>
        <input 
          type="date" 
          name="date" 
          className="glass-input" 
          value={params.date} 
          onChange={handleChange} 
          required
        />
      </div>
      
      <div className="input-divider" />
      
      <div className="input-group">
        <label><FaUser /> Passengers</label>
        <select 
          name="passengers" 
          className="glass-input custom-select" 
          value={params.passengers} 
          onChange={handleChange}
        >
          <option value="1">1 Adult</option>
          <option value="2">2 Adults</option>
          <option value="3">3 Adults</option>
          <option value="4">4+ Adults</option>
        </select>
      </div>

      <button type="submit" className="glass-button search-btn">
        <FaSearch /> Search Flights
      </button>
    </form>
  );
};

export default SearchWidget;
