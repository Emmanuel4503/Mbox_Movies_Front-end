import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiFilm } from "react-icons/fi";
import { BiCameraMovie } from "react-icons/bi";
import { Link } from "react-router-dom";
import "./Favorites.css";

const Favorites = ({ user: initialUser }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your favorites.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`https://mbox-movies-backend.onrender.com/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === "success") {
          setFavorites(result.data || []);
        } else {
          throw new Error(result.message || "Failed to retrieve favorites");
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const renderPlaceholderUI = () => {
    return (
      <div className="favorites-root container movie-theme">
        <motion.h1
          className="favorites-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Favorite Movies <FiHeart className="title-icon" /> 
        </motion.h1>
        <motion.div
          className="favorites-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="film-grain-overlay"></div>
          <div className="error-message film-strip">
            <h3>No Favorites Found!</h3>
            <p>{error || "We couldn't load your favorite movies."}</p>
            <motion.button
              className="retry-button"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="favorites-root container movie-theme">
        <motion.h1
          className="favorites-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FiHeart className="title-icon" /> Your Favorite Movies
        </motion.h1>
        <motion.div
          className="loading-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="film-reel-loader">
            <BiCameraMovie className="film-reel-icon spinning" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading Favorites...
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

  if (error) {
    return renderPlaceholderUI();
  }

  return (
    <div className="favorites-root container movie-theme">
      <motion.h1
        className="favorites-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FiHeart className="title-icon" /> Your Favorite Movies
      </motion.h1>
      <motion.div
        className="favorites-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="film-grain-overlay"></div>
        {favorites.length === 0 ? (
          <div className="no-favorites film-strip">
            <h3>No Favorites Yet!</h3>
            <p>Add movies to your favorites by clicking the bookmark icon on movie pages.</p>
            <Link to="/movies" className="explore-button">
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((movie) => (
              <motion.div
                key={movie._id}
                className="favorite-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
              >
                <Link to={`/movie/${movie._id}`}>
                  <img
                    src={movie.primaryImage || "https://via.placeholder.com/150x225"}
                    alt={movie.originalTitle}
                    className="favorite-poster"
                  />
                  <div className="favorite-info">
                    <h4>{movie.originalTitle}</h4>
                    <p>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A"}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Favorites;