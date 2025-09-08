import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import './MovieCarousel.css';
import { formatMovieDate, getRatingColor } from './movieUtils';

const MovieCarousel = ({ title, movies }) => {
  
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="movies-carousel-section">
      <div className="movies-carousel-header">
        <h2 className="movies-carousel-title">{title}</h2>
      </div>
      
      <div className="movies-carousel-container">
        <div className="movies-carousel-scroller">
          {movies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`} className="movies-card-link">
              <div className="movies-card">
                <div className="movies-card-poster-container">
                  <img 
                    className="movies-card-poster" 
                    src={movie.poster || '/placeholder-poster.jpg'} 
                    alt={`${movie.title} poster`} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-poster.jpg';
                    }}
                  />
                  <div 
                    className="movies-card-rating" 
                    style={{ 
                      backgroundColor: 'var(--movies-rating-background)',
                      border: `2px solid ${getRatingColor(movie.rating)}`
                    }}
                  >
                    {(movie.rating || 0).toFixed(1)}
                  </div>
                </div>
                <div className="movies-card-info">
                  <h3 className="movies-card-title">{movie.title}</h3>
                  <p className="movies-card-date">{formatMovieDate(movie.releaseDate)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="movies-carousel-footer">
        <Link to={`/allmovies`} className="movies-see-all-link">
          See All <FiChevronRight className="movies-see-all-icon" />
        </Link>
      </div>
    </section>
  );
};


const getCategorySlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[&\s]+/g, '-')
    .replace(/[^\w-]+/g, '');
};

export default MovieCarousel;
