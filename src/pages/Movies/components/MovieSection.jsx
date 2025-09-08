import React, { useState, useEffect } from 'react';
import './MovieSection.css';
import MovieCarousel from './MovieCarousel';
import { parseSubGenres } from './movieUtils';
import { motion } from "framer-motion";
import { BiCameraMovie, BiMoviePlay } from "react-icons/bi";
import { FiClock } from 'react-icons/fi';

const genreCategories = {
  // Drama & Emotion
  drama: ['Drama', 'Romance', 'Family', 'Soap'],
  
  // Comedy & Lighthearted
  comedy: ['Comedy', 'Animation', 'Kids', 'Talk', 'Horror'],
  
  // Action & Adventure
  action: ['Action', 'Adventure', 'Action & Adventure', 'War & Politics'],
  
  // Thriller & Suspense
  thriller: ['Thriller', 'Mystery', 'Crime'],
  
  // Sci-Fi & Fantasy
  scifi: ['Science Fiction', 'Fantasy', 'Sci-Fi & Fantasy', 'Western'],
  
  // Real Life & Educational
  documentary: ['Documentary', 'History', 'Music', 'Reality', 'News', 'War', 'TV Movie']
};

const MovieSection = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('popular');

  // Categorized movies
  const [categorizedMovies, setCategorizedMovies] = useState({
    drama: [],
    comedy: [],
    action: [],
    thriller: [],
    scifi: [],
    documentary: []
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://mbox-movies-backend.onrender.com/api/movies');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setMovies(result.data);
          categorizeMovies(result.data);
        } else {
          throw new Error('Failed to fetch movies data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

 // Function to categorize movies based on their subGenres
const categorizeMovies = (moviesData) => {
  const categorized = {
    drama: [],
    comedy: [],
    action: [],
    thriller: [],
    scifi: [],
    documentary: []
  };

  moviesData.forEach(movie => {   
    const movieData = {
      id: movie._id || movie.imbId,
      title: movie.originalTitle,
      poster: movie.primaryImage || '/placeholder-poster.jpg', 
      rating: movie.averageRating || 0,
      releaseDate: movie.releaseDate || new Date().toISOString()
    };

    // Parse and clean subGenres
    const cleanedSubGenres = parseSubGenres(movie.subGenres);
    
    // For debugging
    console.log("Movie:", movie.originalTitle, "Cleaned SubGenres:", cleanedSubGenres);
    
    // Track if movie has been categorized
    let movieCategorized = false;
    
    // Check each category
    for (const [category, genreList] of Object.entries(genreCategories)) {
      // Check if any of the movie's subGenres match this category
      const matchesCategory = cleanedSubGenres.some(subGenre => {
        // Convert both to lowercase and remove any quotes
        const cleanSubGenre = String(subGenre)
          .toLowerCase()
          .replace(/["'[\]]/g, '');
          
        return genreList.some(categoryGenre => 
          cleanSubGenre.includes(categoryGenre.toLowerCase())
        );
      });
      
      // Only add to category if it matches AND the category has less than 10 movies
      if (matchesCategory && !categorized[category].some(m => m.id === movieData.id) && categorized[category].length < 10) {
        categorized[category].push(movieData);
        movieCategorized = true;
        break; 
      }
    }
    

    if (!movieCategorized && categorized.drama.length < 10) {
      categorized.drama.push(movieData);
    }
  });


  Object.entries(categorized).forEach(([category, movies]) => {
    console.log(`${category}: ${movies.length} movies`);
  });

  setCategorizedMovies(categorized);
};

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="movies-section movie-theme">
        <motion.h1 
          className="profile-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BiCameraMovie className="title-icon" /> Movies Collection
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
            Loading Movies...
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
    return (
      <div className="movies-section movie-theme">
        <motion.h1 
          className="profile-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BiCameraMovie className="title-icon" /> Movies Collection
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
            <p>{error || "We couldn't load the movies data from our servers."}</p>
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
  }

  return (
    <div className="movies-section">
      <div className="movies-tabs">
        <button 
          className={`movies-tab ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => handleTabClick('popular')}
        >
          What's Popular
        </button>
        <button 
          className={`movies-tab ${activeTab === 'streaming' ? 'active' : ''}`}
          onClick={() => handleTabClick('streaming')}
        >
          Streaming
        </button>
      </div>

      <div className="movies-content">
        {categorizedMovies.drama.length > 0 && (
          <MovieCarousel title="Drama & Emotion" movies={categorizedMovies.drama} />
        )}
        
        {categorizedMovies.comedy.length > 0 && (
          <MovieCarousel title="Comedy & Lighthearted" movies={categorizedMovies.comedy} />
        )}
        
        {categorizedMovies.action.length > 0 && (
          <MovieCarousel title="Action & Adventure" movies={categorizedMovies.action} />
        )}
        
        {categorizedMovies.thriller.length > 0 && (
          <MovieCarousel title="Thriller & Suspense" movies={categorizedMovies.thriller} />
        )}
        
        {categorizedMovies.scifi.length > 0 && (
          <MovieCarousel title="Sci-Fi & Fantasy" movies={categorizedMovies.scifi} />
        )}
        
        {categorizedMovies.documentary.length > 0 && (
          <MovieCarousel title="Real Life & Educational" movies={categorizedMovies.documentary} />
        )}
        
        {}
        {Object.values(categorizedMovies).every(category => category.length === 0) && (
          <p>No movies available in the selected categories.</p>
        )}
      </div>
    </div>
  );
};

export default MovieSection;
