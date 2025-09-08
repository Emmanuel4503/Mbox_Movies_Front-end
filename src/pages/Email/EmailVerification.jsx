import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmailVerification.css'; // Create this CSS file for custom styling

const EmailVerification = ({ onLogin }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('Please click the verify button to confirm your email address.');
  const { token } = useParams();
  const navigate = useNavigate();

  const verifyEmail = async () => {
    try {
      setVerificationStatus('verifying');
      setMessage('Verifying your email...');
      
      const response = await axios.post('https://mbox-movies-backend.onrender.com/mbox/user/verifyemail', 
        { token },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.status === 'success') {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You will be redirected to login.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 4000);
      } else {
        setVerificationStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      }
    } catch (error) {
      setVerificationStatus('error');
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Verification failed: ${error.response.data.message}`);
      } else {
        setMessage('Verification failed. Please try again or contact support.');
      }
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-content">
          <h2 className="verification-title">Email Verification</h2>
          
          {/* Logo placeholder */}
          <div className="verification-logo">
            <span>MBox</span>
          </div>
          
          <p className="verification-message">{message}</p>
          
          {verificationStatus === 'pending' && (
            <button
              onClick={verifyEmail}
              className="verification-button"
            >
              Verify Email
            </button>
          )}
          
          {verificationStatus === 'verifying' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="verification-success">
              <p className="success-title">Success!</p>
              <p>Redirecting to login page...</p>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="verification-error">
              <p>{message}</p>
              <button
                onClick={verifyEmail}
                className="verification-button retry-button"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;