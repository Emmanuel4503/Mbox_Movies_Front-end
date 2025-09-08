import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiCalendar, FiStar, FiHeart, FiPhone, FiActivity, FiFilm, FiAward, FiClock, FiTrendingUp } from "react-icons/fi";
import { BiCameraMovie, BiMoviePlay } from "react-icons/bi";
import "./UserProfile.css";

const UserProfile = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      let storedUser = initialUser;

      if (!storedUser || !storedUser.id) {
        const fromLocal = localStorage.getItem('userData');
        if (fromLocal) {
          try {
            storedUser = JSON.parse(fromLocal);
            setUser(storedUser);
          } catch (err) {
            console.error("Invalid user data in localStorage.");
          }
        }
      }

      if (!storedUser || !storedUser.id) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`https://mbox-movies-backend.onrender.com/mbox/user/single/${storedUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "Success" && data.Add) {
          setUser({...storedUser, ...data.Add});
        } else {
          throw new Error(data.message || "Failed to retrieve user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [initialUser]);

  const renderPlaceholderUI = () => {
    return (
      <div className="user-profile-root container profile-container movie-theme">
        <motion.div className="film-reel-animation">
          <BiMoviePlay className="film-reel-icon" />
        </motion.div>
        
        <motion.h1 
          className="profile-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BiCameraMovie className="title-icon" /> Your Movie Profile
        </motion.h1>

        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="spotlight-effect"></div>
          <div className="error-message film-strip">
            <h3>Scene Missing!</h3>
            <p>{error || "We couldn't load your profile data from our servers."}</p>
            <motion.button 
              className="retry-button"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiClock /> Try again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="user-profile-root container profile-container movie-theme">
        <motion.h1 
          className="profile-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BiCameraMovie className="title-icon" /> Your Movie Profile
        </motion.h1>
        
        <motion.div 
          className="loading-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="film-reel-loader">
            <BiMoviePlay className="film-reel-icon spinning" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading.....
          </motion.p>
          <motion.div 
            className="loading-bar"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    );
  }

  if (error || !user) {
    return renderPlaceholderUI();
  }

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString() 
    : new Date().toLocaleDateString();

  return (
    <div className="user-profile-root container profile-container movie-theme">

      <motion.h1 
        className="profile-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BiCameraMovie className="title-icon" /> Your Movie Profile
      </motion.h1>

      <motion.div 
        className="profile-card main-feature"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="spotlight-effect"></div>
        <div className="film-grain-overlay"></div>
        
        <div className="profile-header">
          <motion.div 
            className="profile-avatar"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </motion.div>
          <div className="profile-info">
            <motion.h2 
              className="star-name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {user.name || "Movie Fan"}
              <div className="star-highlight"></div>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FiMail className="profile-icon" />
              {user.email || "No email available"}
            </motion.p>
            {user.role && (
              <motion.span 
                className="user-role"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 15px rgba(255, 214, 0, 0.7)" 
                }}
              >
                {user.role}
              </motion.span>
            )}
          </div>
        </div>

        <motion.div 
          className="profile-section movie-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="section-title">
            <FiFilm className="section-icon" />
            Movie Stats
          </h3>
          <div className="info-grid">
            <motion.div 
              className="info-item"
              whileHover={{ 
                y: -5, 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
              }}
            >
              <FiCalendar className="info-icon" />
              <strong>Starring Since:</strong>
              <span>{memberSince}</span>
            </motion.div>
            <motion.div 
              className="info-item"
              whileHover={{ 
                y: -5, 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" 
              }}
            >
              <FiStar className="info-icon pulsing" />
              <strong>Movie Reviews:</strong>
              <span>{user.reviews?.length || 0}</span>
            </motion.div>
            <motion.div 
              className="info-item"
              whileHover={{ 
                y: -5, 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" 
              }}
            >
              <FiHeart className="info-icon" />
              <strong>Favorite Films:</strong>
              <span>{user.favorites?.length || 0}</span>
            </motion.div>
            {user.phone && (
              <motion.div 
                className="info-item"
                whileHover={{ 
                  y: -5, 
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" 
                }}
              >
                <FiPhone className="info-icon" />
                <strong>Contact:</strong>
                <span>{user.phone}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        
        <motion.div 
          className="profile-movie-recommendation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="recommendation-badge">
            <FiTrendingUp className="recommendation-icon" />
          </div>
          <div className="recommendation-title">Your Movie Recommendations</div>
          <div className="recommendation-text">
            Based on your reviews and favorites, we think you'd enjoy these genres:
            <motion.div 
              className="genre-tags"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="genre-tag">Action</span>
              <span className="genre-tag">Drama</span>
              <span className="genre-tag">Sci-Fi</span>
            </motion.div>
            <motion.button 
              className="view-recommendations-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discover New Films
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div 
          className="awards-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="section-title">
            <FiAward className="section-icon" />
            Reviewer Achievements
          </h3>
          <div className="awards-container">
            <motion.div 
              className="award-badge"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="award-icon">🎬</div>
              <div className="award-name">Film Buff</div>
            </motion.div>
            <motion.div 
              className="award-badge locked"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <div className="award-icon">⭐</div>
              <div className="award-name">Top Critic</div>
            </motion.div>
            <motion.div 
              className="award-badge locked"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="award-icon">🏆</div>
              <div className="award-name">Golden Reviewer</div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="film-credits"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        © {new Date().getFullYear()} MovieBox - Your Cinematic Universe
      </motion.div>
    </div>
  );
};

export default UserProfile;