import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmailVerification.css';

const EmailVerification = ({ onLogin }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying your email...');
  const { token } = useParams();
  const navigate = useNavigate();

  const verifyEmail = async () => {
    try {
      setVerificationStatus('verifying');
      setMessage('Verifying your email...');

      // Send GET request to match the email link
      const response = await axios.get(`https://mbox-movies-backend.onrender.com/mbox/user/verify/${token}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check for HTML response indicating success
      if (response.data.includes('Email Verified Successfully')) {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You will be redirected to login.');
        setTimeout(() => {
          navigate('/signin');
          onLogin?.(); // Call onLogin if provided
        }, 4000);
      } else {
        setVerificationStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      }
    } catch (error) {
      setVerificationStatus('error');
      if (error.response?.data?.message) {
        setMessage(`Verification failed: ${error.response.data.message}`);
      } else {
        setMessage('Verification failed. Please try again or contact support.');
      }
    }
  };

  // Automatically trigger verification on mount if token exists
  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-content">
          <h2 className="verification-title">Email Verification</h2>
          <div className="verification-logo">
            <span>MBox</span>
          </div>
          <p className="verification-message">{message}</p>

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