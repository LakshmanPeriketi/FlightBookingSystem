import { useState } from 'react';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import './PaymentGateway.css';

const PaymentGateway = ({ amount, onPaymentSuccess, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Formatting for display
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) {
        value = `${value.substring(0, 2)}/${value.substring(2)}`;
      }
    } else if (name === 'cvc') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate real-world delay for network call to payment processor
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="payment-container animate-fade-in">
      <div className="payment-header">
        <h2>Complete Payment</h2>
        <div className="payment-amount">
          <span>Total to Pay:</span>
          <h3>${amount}</h3>
        </div>
      </div>

      <form onSubmit={handlePayment} className="payment-form glass-card">
        <div className="secure-badge">
          <FaLock /> Secure Payment Processing (Sandbox)
        </div>

        <div className="input-group">
          <label>Cardholder Name</label>
          <input 
            type="text" 
            name="name"
            className="glass-input" 
            placeholder="Name on card"
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="input-group">
          <label>Card Number</label>
          <div className="card-input-wrapper">
            <FaCreditCard className="card-icon" />
            <input 
              type="text" 
              name="cardNumber"
              className="glass-input with-icon" 
              placeholder="0000 0000 0000 0000"
              value={formData.cardNumber}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div className="form-row split">
          <div className="input-group">
            <label>Expiry Date</label>
            <input 
              type="text" 
              name="expiry"
              className="glass-input" 
              placeholder="MM/YY"
              value={formData.expiry}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="input-group">
            <label>CVC</label>
            <input 
              type="text" 
              name="cvc"
              className="glass-input" 
              placeholder="123"
              value={formData.cvc}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div className="payment-actions">
          <button type="button" className="glass-button secondary" onClick={onBack} disabled={isProcessing}>
            Back
          </button>
          <button type="submit" className="glass-button primary w-full" disabled={isProcessing}>
            {isProcessing ? 'Processing Payment...' : `Pay $${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentGateway;
