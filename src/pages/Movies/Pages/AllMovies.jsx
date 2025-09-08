import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiCameraMovie, BiMoviePlay, BiSearch, BiPlay, BiX } from 'react-icons/bi';
import { FiFilter, FiX, FiChevronDown, FiStar, FiCalendar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './AllMovies.css';
import { formatMovieDate, getRatingColor, parseSubGenres } from '../components/movieUtils';


const cleanFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item).replace(/[\[\]"]/g, '').trim().toLowerCase())
      .filter(item => item)
      .join(',');
  }
  if (typeof value === 'string') {
    return value.replace(/[\[\]"]/g, '').trim().toLowerCase();
  }
  return value;
};
// Client-side sort verification function
const verifyAndSortMovies = (movies, sortBy, sortOrder) => {
  const sortedMovies = [...movies];
  switch (sortBy) {
    case 'releaseDate':
      sortedMovies.sort((a, b) => {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      break;
    case 'originalTitle':
      sortedMovies.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc'
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      });
      break;
    case 'averageRating':
      sortedMovies.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
      break;
    default:
      sortedMovies.sort((a, b) => {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return dateB - dateA; // Default: latest release
      });
  }
  console.log('Client-side sorted movies:', sortedMovies.slice(0, 5).map(m => ({
    title: m.title,
    releaseDate: m.releaseDate,
    rating: m.rating
  })));
  return sortedMovies;
};

const MovieListingPage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMovies: 0,
    moviesPerPage: 25
  });
  const [isNavigating, setIsNavigating] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const handleMovieClick = (movieId) => {
    setIsNavigating(movieId);
    setTimeout(() => {
      navigate(`/movie/${movieId}`);
      setIsNavigating(null);
    }, 300); 
  };
  

  const [filters, setFilters] = useState({
    genres: [],
    minRating: 0,
    maxRating: 10,
    releaseYearRange: [1900, new Date().getFullYear()],
    sortBy: 'releaseDate',
    sortOrder: 'desc',
    isAdult: null
  });
  

  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    years: []
  });


  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  

  const featuredVideos = [
    {
      title: "Explore New Releases",
      description: "Discover the latest cinematic masterpieces",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      fallbackUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      title: "Top Rated Films", 
      description: "Find critically acclaimed movies",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      fallbackUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
    },
    {
      title: "Hidden Gems",
      description: "Uncover lesser-known cinematic treasures", 
      videoUrl: "https://cdn.pixabay.com/video/2020/04/07/35266-407130741_large.mp4",
      fallbackUrl: "https://cdn.pixabay.com/video/2020/04/07/35266-407130741_small.mp4",
      
    }
  ];

  // Loop detection
  const resetCountRef = useRef(0);
  const MAX_RESETS = 10;

  // Rotate featured videos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % featuredVideos.length);
      setVideoError(null); // Reset error when switching videos
      setVideoLoaded(false);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleVideoError = (e, videoIndex) => {
    console.error('Video failed to load:', featuredVideos[videoIndex].videoUrl);
    setVideoError(`Video ${videoIndex + 1} failed to load`);
    
    // Try fallback URL
    if (e.target.src !== featuredVideos[videoIndex].fallbackUrl) {
      console.log('Trying fallback URL:', featuredVideos[videoIndex].fallbackUrl);
      e.target.src = featuredVideos[videoIndex].fallbackUrl;
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setVideoError(null);
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play');
    setVideoLoaded(true);
  };

  // Construct API URL with query parameters
  const constructApiUrl = useCallback((isLoadMore = false, sortOverride = null, isReset = false) => {
    const baseUrl = 'https://mbox-movies-backend.onrender.com/api/movies';
    const params = new URLSearchParams();
    
    // Always include basic parameters with proper defaults
    params.append('page', isLoadMore ? pagination.currentPage + 1 : 1);
    params.append('limit', showAllMovies ? 1000 : pagination.moviesPerPage);
    
    // Only add search keyword if present and not resetting
    if (!isReset && searchQuery && searchQuery.trim()) {
      params.append('keyword', searchQuery.trim());
    }
    
    // Only add filters if not resetting
    if (!isReset) {
      // Add genres filter if present
      if (filters.genres && filters.genres.length > 0) {
        params.append('genres', filters.genres.join(','));
      }
      
      // Add release year range if different from defaults
      const currentYear = new Date().getFullYear();
      if (filters.releaseYearRange[0] !== 1900 || filters.releaseYearRange[1] !== currentYear) {
        params.append('releaseYearMin', filters.releaseYearRange[0]);
        params.append('releaseYearMax', filters.releaseYearRange[1]);
      }
      
      // Add rating range if different from defaults
      if (filters.minRating > 0) {
        params.append('minRating', filters.minRating);
      }
      if (filters.maxRating < 10) {
        params.append('maxRating', filters.maxRating);
      }
      
      // Add adult content filter if specified
      if (filters.isAdult !== null) {
        params.append('isAdult', filters.isAdult);
      }
    }
    
    // Use sortOverride if provided, otherwise use filters
    const sortBy = sortOverride ? sortOverride.sortBy : filters.sortBy || 'releaseDate';
    const sortOrder = sortOverride ? sortOverride.sortOrder : filters.sortOrder || 'desc';
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    const url = `${baseUrl}/search?${params.toString()}`;
    console.log('Constructed API URL:', url);
    console.log('Sort parameters:', { sortBy, sortOrder });
    return url;
  }, [searchQuery, filters.genres, filters.minRating, filters.maxRating, filters.releaseYearRange, filters.sortBy, filters.sortOrder, filters.isAdult, pagination.currentPage, pagination.moviesPerPage, showAllMovies]);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.genres.length > 0) count++;
    if (filters.releaseYearRange[0] !== 1900 || filters.releaseYearRange[1] !== new Date().getFullYear()) count++;
    if (filters.minRating > 0 || filters.maxRating < 10) count++;
    if (filters.isAdult !== null) count++;
    setActiveFilters(count);
  }, [filters.genres, filters.releaseYearRange, filters.minRating, filters.maxRating, filters.isAdult]);

  // Reset to initial state
  const resetToInitialState = useCallback(async () => {
    resetCountRef.current += 1;
    console.log('Resetting to initial state, count:', resetCountRef.current);
    
    if (resetCountRef.current > MAX_RESETS) {
      console.error('Too many reset attempts, stopping to prevent infinite loop');
      setError('Failed to load movies: Too many reset attempts');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setSearchQuery('');
    setFilters({
      genres: [],
      minRating: 0,
      maxRating: 10,
      releaseYearRange: [1900, new Date().getFullYear()],
      sortBy: 'releaseDate',
      sortOrder: 'desc',
      isAdult: null
    });
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalMovies: 0,
      moviesPerPage: 25
    });
    setShowAllMovies(false);
    setShowFilters(false);
    setMovies([]);
    setFilteredMovies([]);
    setError(null);
    setActiveFilters(0);
    
    // Fetch fresh movies data with explicit parameters
    try {
      const apiUrl = constructApiUrl(false, { sortBy: 'releaseDate', sortOrder: 'desc' }, true);
      console.log('Fetching initial movies from:', apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status === 'success' && result.data) {
        const moviesData = result.data.map(movie => ({
          id: movie._id || movie.imbId,
          title: movie.originalTitle,
          poster: movie.primaryImage || '/api/placeholder/300/450',
          rating: movie.averageRating || 0,
          releaseDate: movie.releaseDate || new Date().toISOString(),
          description: movie.description || '',
          genres: movie.genres || [],
          subGenres: parseSubGenres(movie.subGenres),
          runtime: movie.runtime || 0
        }));
        
        const sortedMovies = verifyAndSortMovies(moviesData, 'releaseDate', 'desc');
        setMovies(sortedMovies);
        setFilteredMovies(sortedMovies);
        
        if (result.pagination) {
          setPagination({
            currentPage: 1,
            totalPages: result.pagination.totalPages,
            totalMovies: result.pagination.totalMovies,
            moviesPerPage: 25
          });
          setHasMoreMovies(1 < result.pagination.totalPages);
        }
        
        extractFilterOptions(moviesData);
        
        console.log('Initial movies sorted by releaseDate-desc:', sortedMovies.slice(0, 3).map(m => ({
          title: m.title,
          releaseDate: m.releaseDate,
          rating: m.rating
        })));
      } else {
        throw new Error(result.message || 'API returned no data');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(`Failed to load movies: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [constructApiUrl]);

  // Fetch movies data from API
  const fetchMovies = useCallback(async (isLoadMore = false, sortOverride = null) => {
    try {
      if (isLoadMore) {
        setLoadMoreLoading(true);
      } else {
        setSearchLoading(true);
      }
      
      const apiUrl = constructApiUrl(isLoadMore, sortOverride);
      console.log('Fetching from URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status === 'success' && result.data) {
        const moviesData = result.data.map(movie => ({
          id: movie._id || movie.imbId,
          title: movie.originalTitle,
          poster: movie.primaryImage || '/api/placeholder/300/450',
          rating: movie.averageRating || 0,
          releaseDate: movie.releaseDate || new Date().toISOString(),
          description: movie.description || '',
          genres: movie.genres || [],
          subGenres: parseSubGenres(movie.subGenres),
          runtime: movie.runtime || 0
        }));
        
        // Verify and sort movies client-side as a fallback
        const sortBy = sortOverride ? sortOverride.sortBy : filters.sortBy;
        const sortOrder = sortOverride ? sortOverride.sortOrder : filters.sortOrder;
        const sortedMovies = verifyAndSortMovies(moviesData, sortBy, sortOrder);
        
        console.log('Processed movies data:', sortedMovies.slice(0, 3));
        
        if (isLoadMore && !showAllMovies) {
          setMovies(prev => [...prev, ...sortedMovies]);
          setFilteredMovies(prev => [...prev, ...sortedMovies]);
          setPagination(prev => ({
            ...prev,
            currentPage: prev.currentPage + 1
          }));
        } else {
          setMovies(sortedMovies);
          setFilteredMovies(sortedMovies);
          setPagination(prev => ({
            ...prev,
            currentPage: 1
          }));
        }
        
        if (result.pagination) {
          if (isLoadMore && !showAllMovies) {
            setPagination(prev => ({
              ...prev,
              currentPage: prev.currentPage + 1,
              totalPages: result.pagination.totalPages,
              totalMovies: result.pagination.totalMovies
            }));
          } else {
            setPagination({
              currentPage: 1,
              totalPages: result.pagination.totalPages,
              totalMovies: result.pagination.totalMovies,
              moviesPerPage: pagination.moviesPerPage
            });
          }
          
          const currentPage = isLoadMore ? pagination.currentPage + 1 : 1;
          setHasMoreMovies(currentPage < result.pagination.totalPages && !showAllMovies);
        }
        
        // Extract filter options if needed
        if (filterOptions.genres.length === 0 || (searchQuery && moviesData.length > 0)) {
          extractFilterOptions(moviesData);
        }
        
        setError(null);
      } else {
        throw new Error(result.message || 'API returned no data');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      
      let userFriendlyError = 'Unable to load movies at the moment.';
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        userFriendlyError = 'Network connection issue. Please check your internet connection and try again.';
      } else if (err.message.includes('500')) {
        userFriendlyError = 'Server is experiencing issues. Please try again later.';
      } else if (err.message.includes('404')) {
        userFriendlyError = 'Movie service is temporarily unavailable. Please try again later.';
      } else if (err.message.includes('timeout')) {
        userFriendlyError = 'Request timed out. Please try again.';
      } else {
        userFriendlyError = err.message || 'An unexpected error occurred while loading movies.';
      }
      
      setError(userFriendlyError);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
      setSearchLoading(false);
    }
  }, [constructApiUrl, filterOptions.genres.length, pagination.currentPage, showAllMovies, searchQuery, filters.sortBy, filters.sortOrder]);

  // Extract filter options from movie data
  const extractFilterOptions = (moviesData) => {
    const genres = new Set();
    const years = new Set();
    
    moviesData.forEach(movie => {
      movie.genres.forEach(genre => genres.add(cleanFilterValue(genre)));
      movie.subGenres.forEach(subGenre => genres.add(cleanFilterValue(subGenre)));
      
      if (movie.releaseDate) {
        const year = new Date(movie.releaseDate).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    
    setFilterOptions({
      genres: Array.from(genres).sort(),
      years: Array.from(years).sort((a, b) => b - a)
    });
  };

  // Initial fetch on component mount
  useEffect(() => {
    resetToInitialState();
  }, []);

  // Handle search button click
  const handleSearchClick = () => {
    if (searchQuery && searchQuery.trim()) {
      console.log('Searching for:', searchQuery.trim());
      
      setSearchLoading(true);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      setMovies([]);
      setFilteredMovies([]);
      setShowAllMovies(false);
      
      fetchMovies(false, { sortBy: filters.sortBy, sortOrder: filters.sortOrder });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search and reset to initial state
  const clearSearch = () => {
    console.log('Clearing search and resetting to initial state');
    resetToInitialState();
  };

  // Handle filter change
  const handleFilterChange = (filterType, value, isRange = false) => {
    setFilters(prev => {
      if (isRange) {
        return {
          ...prev,
          [filterType]: value
        };
      }
      if (Array.isArray(prev[filterType])) {
        const cleanedValue = cleanFilterValue(value);
        if (prev[filterType].includes(cleanedValue)) {
          return {
            ...prev,
            [filterType]: prev[filterType].filter(item => item !== cleanedValue)
          };
        } else {
          return {
            ...prev,
            [filterType]: [...prev[filterType], cleanedValue]
          };
        }
      } else {
        return {
          ...prev,
          [filterType]: value
        }
      }
    });
  };

  // Apply filters
  const applyFilters = () => {
    console.log('Applying filters:', filters);
    
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setMovies([]);
    setFilteredMovies([]);
    setShowAllMovies(false);
    
    fetchMovies(false, { sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  // Reset all filters and return to initial state
  const resetFilters = () => {
    resetToInitialState();
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMoreMovies) {
      fetchMovies(true, { sortBy: filters.sortBy, sortOrder: filters.sortOrder });
    }
  };

  // Handle sorting change
  const handleSortChange = (sortOption) => {
    const [sortBy, sortOrder] = sortOption.split('-');
    
    console.log('Changing sort to:', { sortBy, sortOrder });
    
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
    
    setPagination(prev => ({ 
      ...prev, 
      currentPage: 1 
    }));
    setMovies([]);
    setFilteredMovies([]);
    setShowAllMovies(false);
    
    fetchMovies(false, { sortBy, sortOrder });
  };

  // Render sorting options
  const renderSortOptions = () => {
    const sortOptions = [
      { value: 'releaseDate-desc', label: 'Latest Release' },
      { value: 'releaseDate-asc', label: 'Oldest Release' },
      { value: 'originalTitle-asc', label: 'Title (A-Z)' },
      { value: 'originalTitle-desc', label: 'Title (Z-A)' },
      { value: 'averageRating-desc', label: 'Highest Rating' },
      { value: 'averageRating-asc', label: 'Lowest Rating' }
    ];

    const currentSort = `${filters.sortBy}-${filters.sortOrder}`;

    return (
      <div className="sort-dropdown">
        <select 
          className="sort-select"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Loading state
  if (loading && movies.length === 0) {
    return (
      <div className="movies-listing-page movie-theme">
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

  // Error state
  if (error && movies.length === 0) {
    return (
      <div className="movies-listing-page movie-theme">
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="spotlight-effect"></div>
          <div className="error-message film-strip">
            <h3>Scene Missing!</h3>
            <p>{error}</p>
            <motion.button 
              className="retry-button"
              onClick={() => {
                resetCountRef.current = 0; // Reset counter on manual retry
                resetToInitialState();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main render
  return (
    <div className="movies-listing-page movie-theme">
      {/* Video Header Section */}
{/* Video Header Section */}
<motion.div 
  className="video-header-section"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
>
  <div className="video-container">
    {videoError ? (
      <div className="video-error">
        <p>{videoError}</p>
      </div>
    ) : (
      <video 
        src={featuredVideos[currentVideoIndex].videoUrl}
        autoPlay
        muted
        loop
        className="header-video"
        onError={(e) => handleVideoError(e, currentVideoIndex)}
        onLoadStart={() => setVideoLoaded(false)}
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoCanPlay}
      />
    )}
    <div className="video-overlay">
      <div className="video-content">
        <h1 className="video-title">
          <BiCameraMovie className="title-icon" />
          {featuredVideos[currentVideoIndex].title}
        </h1>
        <p className="video-description">
          {featuredVideos[currentVideoIndex].description}
        </p>
        <motion.button 
          className="play-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BiPlay />
          <span>Explore Now</span>
        </motion.button>
      </div>
    </div>
  </div>
  
  <div className="video-indicators">
    {featuredVideos.map((_, index) => (
      <button
        key={index}
        className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
        onClick={() => setCurrentVideoIndex(index)}
      />
    ))}
  </div>
</motion.div>

      {/* Search and Filter Toolbar */}
      <div className="movies-listing-toolbar">
        <div className="movies-search-container">
          <div className="movies-search-bar">
            <BiSearch className="search-icon" />
            <input
              type="text"
             placeholder="Search movies by title, ID, or genres..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery('')}
              >
                <FiX />
              </button>
            )}
          </div>
          <motion.button 
            className="search-button"
            onClick={handleSearchClick}
            disabled={!searchQuery.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BiSearch />
            <span>Search</span>
          </motion.button>
          <AnimatePresence>
            {searchQuery.trim() && (
              <motion.button 
                className="clear-search-btn"
                onClick={clearSearch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <span>Clear Search</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        <div className="filter-controls">
          {renderSortOptions()}
          
          <motion.button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`} 
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiFilter />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="filter-count">{activeFilters}</span>
            )}
            <FiChevronDown className={`filter-chevron ${showFilters ? 'open' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="filter-panel enhanced"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filter-grid">
              <div className="filter-section">
                <div className="filter-header">
                  <FiStar className="filter-icon" />
                  <h3>Genres</h3>
                </div>
                <div className="filter-options scrollable">
                  {filterOptions.genres.map(genre => (
                    <motion.label 
                      key={genre} 
                      className={`filter-chip ${filters.genres.includes(genre) ? 'active' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.genres.includes(genre)}
                        onChange={() => handleFilterChange('genres', genre)}
                      />
                      <span>{genre}</span>
                    </motion.label>
                  ))}
                </div>
              </div>
              
              <div className="filter-section">
                <div className="filter-header">
                  <FiStar className="filter-icon" />
                  <h3>Rating Range</h3>
                </div>
                <div className="input-filter">
                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={filters.minRating}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value <= filters.maxRating && value >= 0 && value <= 10) {
                          handleFilterChange('minRating', value);
                        }
                      }}
                      placeholder="Min"
                      className="range-input"
                    />
                    <span className="range-separator">to</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={filters.maxRating}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 10;
                        if (value >= filters.minRating && value >= 0 && value <= 10) {
                          handleFilterChange('maxRating', value);
                        }
                      }}
                      placeholder="Max"
                      className="range-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="filter-section">
                <div className="filter-header">
                  <FiCalendar className="filter-icon" />
                  <h3>Release Year Range</h3>
                </div>
                <div className="input-filter">
                  <div className="input-group">
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={filters.releaseYearRange[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1900;
                        if (value <= filters.releaseYearRange[1] && value >= 1900 && value <= new Date().getFullYear()) {
                          handleFilterChange('releaseYearRange', [value, filters.releaseYearRange[1]], true);
                        }
                      }}
                      placeholder="From"
                      className="range-input"
                    />
                    <span className="range-separator">to</span>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={filters.releaseYearRange[1]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || new Date().getFullYear();
                        if (value >= filters.releaseYearRange[0] && value >= 1900 && value <= new Date().getFullYear()) {
                          handleFilterChange('releaseYearRange', [filters.releaseYearRange[0], value], true);
                        }
                      }}
                      placeholder="To"
                      className="range-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="filter-section">
                <div className="filter-header">
                  <FiFilter className="filter-icon" />
                  <h3>Content Rating</h3>
                </div>
                <div className="content-rating-options">
                  <motion.label 
                    className={`filter-chip ${filters.isAdult === false ? 'active' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="radio"
                      name="isAdult"
                      checked={filters.isAdult === false}
                      onChange={() => handleFilterChange('isAdult', false)}
                    />
                    <span>Family Friendly</span>
                  </motion.label>
                  <motion.label 
                    className={`filter-chip ${filters.isAdult === true ? 'active' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="radio"
                      name="isAdult"
                      checked={filters.isAdult === true}
                      onChange={() => handleFilterChange('isAdult', true)}
                    />
                    <span>Adult Content</span>
                  </motion.label>
                  <motion.label 
                    className={`filter-chip ${filters.isAdult === null ? 'active' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="radio"
                      name="isAdult"
                      checked={filters.isAdult === null}
                      onChange={() => handleFilterChange('isAdult', null)}
                    />
                    <span>All Content</span>
                  </motion.label>
                </div>
              </div>
            </div>
            
            <div className="filter-actions">
              <motion.button 
                className="apply-filters-btn" 
                onClick={applyFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply Filters
              </motion.button>
              <motion.button 
                className="reset-filters-btn" 
                onClick={resetFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset All
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">Active Filters:</span>
          {filters.genres.length > 0 && (
            <motion.div 
              className="filter-pill"
              whileHover={{ scale: 1.05 }}
            >
              <span>Genres: {cleanFilterValue(filters.genres)}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, genres: [] }))}>
                <FiX />
              </button>
            </motion.div>
          )}
          
          {(filters.releaseYearRange[0] !== 1900 || filters.releaseYearRange[1] !== new Date().getFullYear()) && (
            <motion.div 
              className="filter-pill"
              whileHover={{ scale: 1.05 }}
            >
              <span>Years: {filters.releaseYearRange[0]} - {filters.releaseYearRange[1]}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, releaseYearRange: [1900, new Date().getFullYear()] }))}>
                <FiX />
              </button>
            </motion.div>
          )}
          
          {(filters.minRating > 0 || filters.maxRating < 10) && (
            <motion.div 
              className="filter-pill"
              whileHover={{ scale: 1.05 }}
            >
              <span>Rating: {filters.minRating} - {filters.maxRating}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, minRating: 0, maxRating: 10 }))}>
                <FiX />
              </button>
            </motion.div>
          )}
          
          {filters.isAdult !== null && (
            <motion.div 
              className="filter-pill"
              whileHover={{ scale: 1.05 }}
            >
              <span>Content: {filters.isAdult ? 'Adult' : 'Family Friendly'}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, isAdult: null }))}>
                <FiX />
              </button>
            </motion.div>
          )}
          
          <motion.button 
            className="clear-all-filters" 
            onClick={resetFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        </div>
      )}

      {/* Results Info */}
      <div className="movies-results-info">
        {!loading && (
          <div className="results-details">
            <p className="primary-count">
              {hasMoreMovies ? (
                <>Loaded {filteredMovies.length} of {pagination.totalMovies || '...'} movies</>
              ) : (
                <>Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}</>
              )}
              {searchQuery && <span className="search-term"> for "{searchQuery}"</span>}
            </p>
            {pagination.totalPages > 1 && (
              <p className="pagination-info">
               
              </p>
            )}
          </div>
        )}
      </div>
      {/* Movies Grid */}
      <div className="movies-grid-container">
  {searchLoading && (
    <motion.div 
      className="search-loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BiMoviePlay className="loading-icon spinning" />
      <p>Searching movies...</p>
    </motion.div>
  )}

  {filteredMovies.length > 0 ? (
    <>
      <div className="movies-grid">
        {filteredMovies.map((movie, index) => (
          <motion.div 
            key={`${movie.id}-${index}`}
            className={`movie-grid-item ${isNavigating === movie.id ? 'disabled' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (index % 25) * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => isNavigating ? null : handleMovieClick(movie.id)}
            role="button"
            aria-label={`View details for ${movie.title}`}
          >
            <div className="movie-grid-card">
              {isNavigating === movie.id && (
                <div className="navigating-overlay">
                  <BiMoviePlay className="loading-icon spinning" />
                </div>
              )}
              <div className="movie-grid-poster-container">
                <img 
                  className="movie-grid-poster" 
                  src={movie.poster} 
                  alt={`${movie.title} poster`} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/api/placeholder/300/450';
                  }}
                />
                <div 
                  className="movie-grid-rating" 
                  style={{ 
                    backgroundColor: 'var(--movies-rating-background)',
                    border: `2px solid ${getRatingColor(movie.rating)}`
                  }}
                >
                  {(movie.rating || 0).toFixed(1)}
                </div>
              </div>
              <div className="movie-grid-info">
                <h3 className="movie-grid-title">{movie.title}</h3>
                <p className="movie-grid-date">{formatMovieDate(movie.releaseDate)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {hasMoreMovies && (
        <motion.div
          className="load-more-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="load-more-button"
            onClick={handleLoadMore}
            disabled={loadMoreLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loadMoreLoading ? (
              <>
                <BiMoviePlay className="loading-icon spinning" />
                <span>Loading More...</span>
              </>
            ) : (
              <span>Load More</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </>
  ) : !loading && !searchLoading ? (
    <motion.div 
      className="no-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <BiMoviePlay className="no-results-icon" />
      <h3>No movies found</h3>
      <p>
        {error ? error : (
          searchQuery 
            ? `No movies match your search for "${searchQuery}"` 
            : "Try adjusting your filters to see more results"
        )}
      </p>
    </motion.div>
  ) : null}
</div>
    </div>
  );
};

export default MovieListingPage;



// AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA