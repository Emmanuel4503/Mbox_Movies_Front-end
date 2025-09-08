import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import './SignUp.css';

// Movie data for the rotating background
const movieData = [
  {
    image: 'https://sm.ign.com/ign_pk/photo/b/best-actio/best-action-movies-on-netflix-right-now-september-2022_pp8p.jpg',
    title: 'The Dark Knight',
    tagline: 'Why So Serious?'
  },
  {
    image: 'https://i0.wp.com/www.thewrap.com/wp-content/uploads/2024/04/boy-kills-world-cast-characters-bill-skarsgard.jpg?fit=990%2C557&quality=89&ssl=1',
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime'
  },
  {
    image: 'https://static1.colliderimages.com/wordpress/wp-content/uploads/2022/03/movies-like-the-adam-project.jpg',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.'
  },
  {
    image: 'https://images.news18.com/ibnlive/uploads/2023/11/tabu-birthday-latest-movies-2023-11-56283c35a283be24f0f9cd05b6aaa6d0.jpg',
    title: 'Pulp Fiction',
    tagline: 'You won\'t know the facts until you\'ve seen the fiction'
  }
];

const SignUp = ({ onSignup }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);
  
  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % movieData.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: ''
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('https://mbox-movies-backend.onrender.com/mbox/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'Success') {
        navigate('/verificationpending', { state: { email: formData.email } });
      } else {
        setErrors({
          ...errors,
          form: data.message || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        form: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get a random movie recommendation
  const getRandomRecommendation = () => {
    const recommendations = [
      "If you enjoyed Inception, try watching Shutter Island.",
      "Fans of The Matrix might enjoy Blade Runner 2049.",
      "If you like Star Wars, check out Dune.",
      "Enjoyed The Shawshank Redemption? Try The Green Mile."
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };

  return (
    <div className="signup-container">
       <Link to="/" className="signin-back-arrow">
        <FiArrowLeft className="signin-back-arrow-icon" />
        {/* <span className="signin-back-arrow-text">Back to Home</span> */}
      </Link>
      <motion.div 
        className="signup-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="signup-container-inner">
          <div className="signup-header">
            <motion.div 
              className="signup-logo-area"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="signup-movie-icon">🎬</span>
              <h2>Mbox Movies</h2>
            </motion.div>
            <h1>Join The Community</h1>
            <p>Share your thoughts on the latest films with fellow movie enthusiasts</p>
          </div>
          
          {errors.form && (
            <motion.div 
              className="signup-error-message signup-form-error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {errors.form}
            </motion.div>
          )}
          
          <div className="signup-step-indicators">
            <div className={`signup-step-indicator ${step >= 1 ? 'active' : ''}`}>
              <span className="signup-step-number">1</span>
              <span className="signup-step-label">Profile</span>
            </div>
            <div className="signup-step-connector" />
            <div className={`signup-step-indicator ${step >= 2 ? 'active' : ''}`}>
              <span className="signup-step-number">2</span>
              <span className="signup-step-label">Security</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="signup-form">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="signup-form-step"
                >
                  <div className="signup-form-group">
                    <label htmlFor="name">
                      <FiUser className="signup-input-icon" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? 'signup-input-error' : ''}
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <motion.span 
                        className="signup-error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.name}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="signup-form-group">
                    <label htmlFor="email">
                      <FiMail className="signup-input-icon" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'signup-input-error' : ''}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <motion.span 
                        className="signup-error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.email}
                      </motion.span>
                    )}
                  </div>
                  
                  <motion.button 
                    type="button" 
                    className="signup-button signup-next-button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Continue <FiArrowRight className="signup-button-icon" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="signup-form-step"
                >
                  <div className="signup-form-group">
                    <label htmlFor="password">
                      <FiLock className="signup-input-icon" />
                      <span>Password</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'signup-input-error' : ''}
                      placeholder="Create a strong password"
                    />
                    {errors.password && (
                      <motion.span 
                        className="signup-error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.password}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="signup-form-group">
                    <label htmlFor="confirmPassword">
                      <FiCheck className="signup-input-icon" />
                      <span>Confirm Password</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'signup-input-error' : ''}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <motion.span 
                        className="signup-error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {errors.confirmPassword}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="signup-button-group">
                    <motion.button 
                      type="button" 
                      className="signup-back-button"
                      onClick={prevStep}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Back
                    </motion.button>
                    
                    <motion.button 
                      type="submit" 
                      className="signup-button"
                      disabled={isLoading}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isLoading ? (
                        <span className="signup-loading-spinner"></span>
                      ) : (
                        <>
                          Create Account <FiCheck className="signup-button-icon" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <div className="signup-login-link">
            Already have an account? <a href="/signin">Log In</a>
          </div>
          
          <div className="signup-movie-recommendation">
            <div className="signup-recommendation-title">Movie Recommendation</div>
            <div className="signup-recommendation-text">{getRandomRecommendation()}</div>
          </div>
        </div>
      </motion.div>
      
      <div className="signup-movie-backgrounds">
        {movieData.map((movie, index) => (
          <div 
            key={index} 
            className={`signup-movie-background ${index === currentBackground ? 'active' : ''}`} 
            style={{ backgroundImage: `url(${movie.image})` }}
          />
        ))}
        
        <motion.div 
          className="signup-movie-title-overlay"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          key={currentBackground}
        >
          <h3>{movieData[currentBackground].title}</h3>
          <p>{movieData[currentBackground].tagline}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;