import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import './SignIn.css';

// Movie data for the rotating background
const movieData = [
  {
    image: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2024/07/split-image-of-the-venom-the-last-dance-poster-and-kraven-the-hunter.jpg',
    title: 'The Godfather',
    tagline: 'An offer you can\'t refuse'
  },
  {
    image: 'https://hips.hearstapps.com/hmg-prod/images/cinema-goers-1596050032.jpg?resize=980:*',
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.'
  },
  {
    image: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/05/the-rock-fast-x-return.jpg',
    title: 'The Matrix',
    tagline: 'Free your mind'
  },
];

const SignIn = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);
  
  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % movieData.length);
    }, 6000);
  
    return () => clearInterval(interval); // Cleanup on unmount
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

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// Add this above handleSubmit in your SignIn.jsx
const handleSuccessfulLogin = (userData, token) => {
  // Store token
  localStorage.setItem('token', token);
  
  // Store user data
  localStorage.setItem('userData', JSON.stringify({
    id: userData._id,
    name: userData.name,
    email: userData.email
  }));
  
  // Call onLogin callback if provided
  if (onLogin) {
    onLogin({
      name: userData.name,
      email: userData.email,
      id: userData._id
    });
  }

  // // Navigate to homepage
  // navigate('/movies');
};

// Update your existing handleSubmit with this:
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('https://mbox-movies-backend.onrender.com/mbox/user/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      handleSuccessfulLogin(data.user, data.token); // 👈 Using the new helper
    } else {
      setErrors({
        ...errors,
        form: data.message || 'Invalid email or password. Please try again.'
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
      "If you enjoyed The Godfather, try watching Goodfellas.",
      "Fans of The Matrix might enjoy Blade Runner 2049.",
      "If you like Star Wars, check out Dune.",
      "Enjoyed The Shawshank Redemption? Try The Green Mile."
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  };

  return (
    <div className="signin-container">
      <Link to="/" className="signin-back-arrow">
        <FiArrowLeft className="signin-back-arrow-icon" />
        {/* <span className="signin-back-arrow-text">Back to Home</span> */}
      </Link>
      <motion.div 
        className="signin-card"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="signin-container-inner">
          <div className="signin-header">
            <motion.div 
              className="signin-logo-area"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="signin-movie-icon">🎬</span>
              <h2>Mbox Movies</h2>
            </motion.div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey with fellow movie enthusiasts</p>
          </div>
          
          {errors.form && (
            <motion.div 
              className="signin-error-message signin-form-error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {errors.form}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="signin-form">
            <AnimatePresence mode="wait">
              <motion.div 
                key="signinform"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="signin-form-step"
              >
                <div className="signin-form-group">
                  <label htmlFor="email">
                    <FiMail className="signin-input-icon" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'signin-input-error' : ''}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <motion.span 
                      className="signin-error-message"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.email}
                    </motion.span>
                  )}
                </div>
                
                <div className="signin-form-group">
                  <label htmlFor="password">
                    <FiLock className="signin-input-icon" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'signin-input-error' : ''}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <motion.span 
                      className="signin-error-message"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.password}
                    </motion.span>
                  )}
                </div>
                
                <div className="signin-forgot-password">
                  <a href="/forgot-password">Forgot password?</a>
                </div>
                
                <motion.button 
                  type="submit" 
                  className="signin-button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLoading ? (
                    <span className="signin-loading-spinner"></span>
                  ) : (
                    <>
                      Sign In <FiLogIn className="signin-button-icon" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </form>
          
          <div className="signin-signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </div>
          
          <div className="signin-movie-recommendation">
            <div className="signin-recommendation-title">Movie Recommendation</div>
            <div className="signin-recommendation-text">{getRandomRecommendation()}</div>
          </div>
        </div>
      </motion.div>
      
      <div className="signin-movie-backgrounds">
        {movieData.map((movie, index) => (
          <div 
            key={index} 
            className={`signin-movie-background ${index === currentBackground ? 'active' : ''}`} 
            style={{ backgroundImage: `url(${movie.image})` }}
          />
        ))}
        
        <motion.div 
          className="signin-movie-title-overlay"
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

export default SignIn;