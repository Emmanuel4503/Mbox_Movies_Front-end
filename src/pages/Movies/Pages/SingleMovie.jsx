import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiPlay, BiX, BiStar, BiCalendar, BiGlobe, BiCast, BiArrowBack } from 'react-icons/bi';
import { FiBookmark, FiShare2, FiMapPin, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './SingleMovie.css';
import { formatMovieDate, getRatingColor } from '../components/movieUtils';

const SingleMovie = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerError, setTrailerError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false); 
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch movie data
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://mbox-movies-backend.onrender.com/api/movies/${movieId}`);
        
        if (!response.ok) {
          throw new Error(`Movie not found (${response.status})`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setMovie(result.data);
        } else {
          throw new Error(result.message || 'Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  // Fetch favorite status
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const token = getAuthToken();
      if (!token || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
        console.warn('No token or invalid movieId, skipping favorite status fetch');
        return;
      }

      try {
        const response = await fetch(`https://mbox-movies-backend.onrender.com/api/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          console.warn('Session expired, clearing local storage');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const isMovieFavorited = result.data.some(favorite => favorite._id.toString() === movieId);
          setIsFavorited(isMovieFavorited);
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    if (movieId) {
      fetchFavoriteStatus();
    }
  }, [movieId]);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    const token = getAuthToken();
    const userData = getUserData();

    if (!token || !userData) {
      alert('Please log in to favorite this movie');
      navigate('/signin');
      return;
    }

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited
        ? `https://mbox-movies-backend.onrender.com/api/favorites/${movieId}`
        : `https://mbox-movies-backend.onrender.com/api/favorites`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isFavorited ? null : JSON.stringify({ movieId })
      });

      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setIsFavorited(!isFavorited);
        alert(isFavorited ? 'Movie removed from favorites' : 'Movie added to favorites');
      } else {
        alert(result.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      alert('Failed to update favorites');
    }
  };

  // Fetch rating stats
  useEffect(() => {
    const fetchRatingStats = async () => {
      if (!/^[0-9a-fA-F]{24}$/.test(movieId)) {
        console.error('Invalid movieId format:', movieId);
        setError('Invalid movie ID');
        return;
      }
      try {
        const response = await fetch(`https://mbox-movies-backend.onrender.com/review-comments/movie/${movieId}/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        
        console.log('Full API response:', result);
        console.log('Rating stats data:', result.data);
        console.log('Rating distribution:', result.data?.ratingDistribution);
        
        if (result.status === 'success') {
          let distribution = result.data?.ratingDistribution;
          if (Array.isArray(distribution) && distribution.length > 0) {
            distribution = distribution[0];
          } else if (!distribution) {
            distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
          }
          
          const statsData = {
            averageRating: result.data?.averageRating || 0,
            totalRatings: result.data?.totalRatings || 0,
            ratingDistribution: distribution
          };
          
          console.log('Setting rating stats to:', statsData);
          setRatingStats(statsData);
        } else {
          console.error('API error:', result.message);
        }
      } catch (error) {
        console.error('Error fetching rating stats:', error);
      }
    };

    if (movieId) {
      fetchRatingStats();
    }
  }, [movieId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!/^[0-9a-fA-F]{24}$/.test(movieId)) {
        console.error('Invalid movieId format:', movieId);
        return;
      }
      try {
        const response = await fetch(`https://mbox-movies-backend.onrender.com/review-comments/movie/${movieId}/comments`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status === 'success') {
          setComments(result.data);
        } else {
          console.error('API error:', result.message);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (movieId) {
      fetchComments();
    }
  }, [movieId]);

  // Fetch user's rating
  useEffect(() => {
    const fetchUserRating = async () => {
      const token = getAuthToken();
      if (!token || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
        console.warn('No token or invalid movieId, skipping user rating fetch');
        const savedRating = localStorage.getItem(`userRating_${movieId}`);
        if (savedRating) {
          setUserRating(Number(savedRating));
        }
        return;
      }

      try {
        const response = await fetch(`https://mbox-movies-backend.onrender.com/review-comments/movie/${movieId}/user-rating`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          console.warn('Session expired, clearing local storage');
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data?.rating) {
          setUserRating(Number(result.data.rating));
          localStorage.setItem(`userRating_${movieId}`, result.data.rating);
        } else {
          const savedRating = localStorage.getItem(`userRating_${movieId}`);
          if (savedRating) {
            setUserRating(Number(savedRating));
          }
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
        const savedRating = localStorage.getItem(`userRating_${movieId}`);
        if (savedRating) {
          setUserRating(Number(savedRating));
        }
      }
    };

    if (movieId) {
      fetchUserRating();
    }
  }, [movieId]);

  // Submit rating
  const handleRatingSubmit = async (rating) => {
    const token = getAuthToken();
    if (!token) {
      alert('Please log in to rate this movie');
      navigate('/signin');
      return;
    }

    const integerRating = Math.floor(Number(rating));
    if (!integerRating || integerRating < 1 || integerRating > 5) {
      alert('Invalid rating value');
      return;
    }

    setSubmittingRating(true);
    try {
      console.log('Submitting rating with headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      const response = await fetch('https://mbox-movies-backend.onrender.com/review-comments/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: movieId,
          rating: integerRating
        })
      });
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/signin');
        return;
      }
      const result = await response.json();
      if (result.status === 'success') {
        setUserRating(integerRating);
        localStorage.setItem(`userRating_${movieId}`, integerRating);
        const statsResponse = await fetch(`https://mbox-movies-backend.onrender.com/review-comments/movie/${movieId}/stats`);
        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          if (statsResult.status === 'success') {
            let distribution = statsResult.data?.ratingDistribution;
            if (Array.isArray(distribution) && distribution.length > 0) {
              distribution = distribution[0];
            } else if (!distribution) {
              distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
            }
            
            const statsData = {
              averageRating: statsResult.data?.averageRating || 0,
              totalRatings: statsResult.data?.totalRatings || 0,
              ratingDistribution: distribution
            };
            
            console.log('Updating rating stats to:', statsData);
            setRatingStats(statsData);
          }
        }
      } else {
        alert(result.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    const userData = getUserData();
    
    if (!token || !userData) {
      alert('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch('https://mbox-movies-backend.onrender.com/review-comments/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: movieId,
          comment: newComment.trim()
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        const newCommentData = {
          ...result.data,
          userId: {
            name: userData.name || userData.username || 'Anonymous',
            email: userData.email
          }
        };
        setComments([newCommentData, ...comments]);
        setNewComment('');
      } else {
        alert(result.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMs = now - commentDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  // Handle trailer modal
  const openTrailerModal = () => {
    if (movie?.trailer) {
      setTrailerLoading(true);
      setTrailerError(null);
      setShowTrailerModal(true);
    } else {
      console.warn('No trailer URL provided for movie:', movie?.originalTitle);
      setTrailerError('No trailer available for this movie.');
      setShowTrailerModal(true);
    }
  };

  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setTrailerLoading(false);
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') {
      console.error('Invalid trailer URL:', url);
      return null;
    }

    let videoId = null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtube\.com\/v\/)([\w-]+)/,
      /(?:youtube\.com\/shorts\/)([\w-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } else {
      console.error('Could not extract YouTube video ID from URL:', url);
      return null;
    }
  };

  // Get content rating
  const getContentRating = (isAdult) => {
    return isAdult ? 'AC' : 'FC';
  };

  // Get user score percentage
  const getUserScore = (rating) => {
    if (!rating) return '0%';
    return `${Math.round((rating / 10) * 100)}%`;
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="single-movie-page">
        <div className="loading-container">
          <motion.div 
            className="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="film-reel-loader">
              <BiPlay className="film-reel-icon spinning" />
            </div>
            <p>Loading Movie Details...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movie) {
    return (
      <div className="single-movie-page">
        <div className="error-container">
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>Movie Not Found</h3>
            <p>{error || 'The requested movie could not be found.'}</p>
            <motion.button 
              className="back-button"
              onClick={() => navigate('/allmovies')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Movies
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="single-movie-page">
      {}
      <motion.button
        className="back-arrow"
        onClick={handleBackClick}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <BiArrowBack />
      </motion.button>

      <motion.div 
        className="movie-hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="movie-backdrop">
          <img 
            src={movie.primaryImage || '/api/placeholder/1200/675'} 
            alt={`${movie.originalTitle} backdrop`}
            className="backdrop-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/api/placeholder/1200/675';
            }}
          />
          <div className="backdrop-overlay"></div>
        </div>

        <div className="movie-hero-content">
          <div className="movie-poster-section">
            <motion.div 
              className="movie-poster-container"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src={movie.primaryImage || '/api/placeholder/300/450'} 
                alt={`${movie.originalTitle} poster`}
                className="movie-poster"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/300/450';
                }}
              />
            </motion.div>
          </div>

          <div className="movie-details-section">
            <motion.div 
              className="movie-main-info"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="movie-title">{movie.originalTitle}</h1>
              
              <div className="movie-meta-info">
                <span className="release-year">
                  {new Date(movie.releaseDate).getFullYear()}
                </span>
                <span className="content-rating">{getContentRating(movie.isAdult)}</span>
                <span className="release-date">
                  <BiCalendar className="meta-icon" />
                  {formatMovieDate(movie.releaseDate)}
                </span>
              </div>

              <div className="movie-genres">
                {movie.genres && Array.isArray(movie.genres) && movie.genres.map((genre, index) => (
                  <span key={index} className="genre-tag">{String(genre)}</span>
                ))}
                {movie.subGenres && Array.isArray(movie.subGenres) && movie.subGenres.map((subGenre, index) => (
                  <span key={`sub-${index}`} className="subgenre-tag">{String(subGenre)}</span>
                ))}
              </div>

              <div className="movie-rating-section">
                <div className="user-score">
                  <div 
                    className="score-circle"
                    style={{ 
                      background: `conic-gradient(${getRatingColor(movie.averageRating)} ${(movie.averageRating / 10) * 360}deg, #1a1a1a 0deg)`
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-percentage">{getUserScore(movie.averageRating)}</span>
                    </div>
                  </div>
                  <span className="score-label">User Score</span>
                </div>
              </div>

              <div className="movie-actions">
                {movie.trailer && (
                  <motion.button 
                    className="trailer-button"
                    onClick={openTrailerModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={trailerLoading}
                  >
                    <BiPlay className="action-icon" />
                    {trailerLoading ? 'Loading...' : 'Play Trailer'}
                  </motion.button>
                )}
                
                <motion.button 
  className={`save-button ${isFavorited ? 'favorited' : ''}`}
  onClick={handleFavoriteToggle}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  aria-label={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
>
  <FiBookmark className="action-icon" />

</motion.button>
                
                <motion.button 
                  className="share-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiShare2 className="action-icon" />
                </motion.button>
              </div>

              <div className="movie-overview">
                <h3>Overview</h3>
                <p>{movie.description}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {}
      <motion.div 
        className="movie-additional-details"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="details-grid">
          {movie.countriesOfOrigin && Array.isArray(movie.countriesOfOrigin) && movie.countriesOfOrigin.length > 0 && (
            <div className="detail-section">
              <h4>
                <BiGlobe className="detail-icon" />
                Countries of Origin
              </h4>
              <div className="detail-content">
                {movie.countriesOfOrigin.map((country, index) => (
                  <span key={index} className="detail-item">{String(country)}</span>
                ))}
              </div>
            </div>
          )}

          {movie.spokenLanguages && Array.isArray(movie.spokenLanguages) && movie.spokenLanguages.length > 0 && (
            <div className="detail-section">
              <h4>
                <BiCast className="detail-icon" />
                Spoken Languages
              </h4>
              <div className="detail-content">
                {movie.spokenLanguages.map((language, index) => (
                  <span key={index} className="detail-item">{String(language)}</span>
                ))}
              </div>
            </div>
          )}

          {movie.filmingLocations && Array.isArray(movie.filmingLocations) && movie.filmingLocations.length > 0 && (
            <div className="detail-section">
              <h4>
                <FiMapPin className="detail-icon" />
                Filming Locations
              </h4>
              <div className="detail-content">
                {movie.filmingLocations.map((location, index) => (
                  <span key={index} className="detail-item">{String(location)}</span>
                ))}
              </div>
            </div>
          )}

          {movie.productionCompanies && Array.isArray(movie.productionCompanies) && movie.productionCompanies.length > 0 && (
            <div className="detail-section">
              <h4>
                <BiStar className="detail-icon" />
                Production Companies
              </h4>
              <div className="detail-content">
                {movie.productionCompanies.map((company, index) => (
                  <span key={index} className="detail-item">
                    {String(typeof company === 'object' ? company.name : company)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {}
      <motion.div 
        className="reviews-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="rating-section">
          <div className="rating-header">
            <h3>Rate This Movie</h3>
            <div className="rating-stats">
              <span className="average-rating">
                {Math.round(Number(ratingStats.averageRating || 0))}/5
              </span>
              <span className="total-ratings">
                ({Number(ratingStats.totalRatings || 0)} ratings)
              </span>
            </div>
          </div>
          
          <div className="star-rating-container">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  className={`star ${(hoverRating || userRating) >= star ? 'active' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingSubmit(star)}
                  disabled={submittingRating}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BiStar />
                </motion.button>
              ))}
            </div>
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = Number(ratingStats.ratingDistribution?.[rating] || 0);
                const percentage = ratingStats.totalRatings > 0 
                  ? (count / Number(ratingStats.totalRatings)) * 100 
                  : 0;
                
                console.log(`Rating ${rating}: count=${count}, total=${ratingStats.totalRatings}, percentage=${percentage}%`);
                
                return (
                  <div key={rating} className="rating-bar">
                    <span className="rating-number">{rating}</span>
                    <BiStar className="rating-star" />
                    <div className="rating-bar-bg">
                      <div 
                        className="rating-bar-fill"
                        style={{ 
                          width: `${percentage}%`,
                          minWidth: count > 0 ? '2px' : '0px'
                        }}
                      ></div>
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({comments.length})</h3>
          </div>
          
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="comment-input-container">
              <textarea
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={3}
                disabled={submittingComment}
              />
              <motion.button
                type="submit"
                className="comment-submit-btn"
                disabled={submittingComment || !newComment.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {submittingComment ? (
                  <div className="loading-spinner-small"></div>
                ) : (
                  <FiSend />
                )}
              </motion.button>
            </div>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  className="comment-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="comment-header">
                    <div className="comment-user">
                      <div className="user-avatar">
                        {String(comment.userId?.name?.charAt(0)?.toUpperCase() || 'A')}
                      </div>
                      <div className="user-info">
                        <span className="user-name">
                          {String(comment.userId?.name || 'Anonymous')}
                        </span>
                        <span className="comment-time">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>{String(comment.comment)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTrailerModal && (
          <motion.div
            className="trailer-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeTrailerModal}
          >
            <motion.div
              className="trailer-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-modal-button"
                onClick={closeTrailerModal}
                aria-label="Close trailer modal"
              >
                <BiX />
              </button>
              <div className="video-container">
                <motion.div
                  className={`trailer-loading ${!trailerLoading && !trailerError ? 'hidden' : ''}`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: !trailerLoading && !trailerError ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="trailer-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="film-reel" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-12h-2v2h2V8zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zM8 8H6v2h2V8zm0 4H6v2h2v-2zm0 4H6v2h2v-2z" />
                    </svg>
                  </motion.div>
                  <motion.p
                    className="loading-text"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    Loading Trailer...
                  </motion.p>
                  <div className="loading-progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>

                {trailerError ? (
                  <div className="trailer-error">
                    <p>{trailerError}</p>
                  </div>
                ) : (
                  <>
                    {getYouTubeEmbedUrl(movie.trailer) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(movie.trailer)}
                        title="Movie Trailer"
                        className="trailer-video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => {
                          console.log('Iframe trailer loaded');
                          setTrailerLoading(false);
                        }}
                        onError={(e) => {
                          console.error('Iframe trailer error:', e);
                          setTrailerLoading(false);
                          setTrailerError('Failed to load trailer. Please try again later.');
                        }}
                      />
                    ) : (
                      <video
                        controls
                        autoPlay
                        className="trailer-video"
                        src={movie.trailer}
                        onLoadedData={() => {
                          console.log('Video trailer loaded');
                          setTrailerLoading(false);
                        }}
                        onError={(e) => {
                          console.error('Video trailer error:', e);
                          setTrailerLoading(false);
                          setTrailerError('Failed to load trailer. Invalid video source.');
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SingleMovie;