import './Filters.css';

const Filters = ({ filters, onChange, availableAirlines }) => {
  const handlePriceChange = (e) => {
    onChange({
      ...filters,
      priceRange: [0, parseInt(e.target.value)]
    });
  };

  const handleStopChange = (e) => {
    onChange({
      ...filters,
      stops: e.target.value
    });
  };

  const handleAirlineToggle = (airline) => {
    const updatedAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
      
    onChange({
      ...filters,
      airlines: updatedAirlines
    });
  };

  return (
    <div className="filters-container">
      <div className="filter-header">
        <h3>Filters</h3>
        <button 
          className="reset-btn"
          onClick={() => onChange({ priceRange: [0, 2000], stops: 'any', airlines: [] })}
        >
          Reset
        </button>
      </div>

      <div className="filter-section">
        <h4>Max Price: ${filters.priceRange[1]}</h4>
        <input 
          type="range" 
          min="100" 
          max="2000" 
          step="50"
          value={filters.priceRange[1]} 
          onChange={handlePriceChange}
          className="range-slider"
        />
        <div className="range-labels">
          <span>$100</span>
          <span>$2000</span>
        </div>
      </div>

      <div className="filter-divider"></div>

      <div className="filter-section">
        <h4>Stops</h4>
        <div className="radio-group">
          <label className="radio-label">
            <input 
              type="radio" 
              name="stops" 
              value="any" 
              checked={filters.stops === 'any'} 
              onChange={handleStopChange}
            />
            <span className="radio-custom"></span>
            Any stops
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="stops" 
              value="0" 
              checked={filters.stops === '0'} 
              onChange={handleStopChange}
            />
            <span className="radio-custom"></span>
            Direct only
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="stops" 
              value="1" 
              checked={filters.stops === '1'} 
              onChange={handleStopChange}
            />
            <span className="radio-custom"></span>
            1 Stop max
          </label>
        </div>
      </div>

      <div className="filter-divider"></div>

      <div className="filter-section">
        <h4>Airlines</h4>
        <div className="checkbox-group">
          {availableAirlines.map(airline => (
            <label key={airline} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={filters.airlines.includes(airline)}
                onChange={() => handleAirlineToggle(airline)}
              />
              <span className="checkbox-custom"></span>
              {airline}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
