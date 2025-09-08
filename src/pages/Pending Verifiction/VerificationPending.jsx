import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerificationPending.css';

const VerificationPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const emailFromState = location.state?.email;
    
    if (!emailFromState) {
      navigate('/signup');
      return;
    }
    
    setEmail(emailFromState);
  }, [location, navigate]);
  
  const handleContinue = () => {
    navigate('/signin');
  };
  
  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1>Check Your Email</h1>
        
        <p className="verification-message">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        
        <p className="verification-instructions">
          Please check your inbox and click the verification link to complete your registration.
          The link will expire in 30 minutes.
        </p>
        
        <div className="verification-tips">
          <h3>Can't find the email?</h3>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Verify your email address is correct</li>
            <li>Allow a few minutes for delivery</li>
          </ul>
        </div>
        
        <button 
          className="continue-button"
          onClick={handleContinue}
        >
          Continue to Sign In
        </button>
        
        <div className="back-to-signup">
          <a href="/signup">Back to Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;