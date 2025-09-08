import React from 'react';
import MovieSection from './components/MovieSection';
import './Movies.css';

const Movies = () => {
  return (
    <div className="movies-page">
      <div className="movies-hero">
        <div className="movies-hero-content">
          <h1>Discover Movies & TV Shows</h1>
          <p>Find the perfect movie or show to watch with thousands of titles available.</p>
        </div>
      </div>
      <MovieSection />
    </div>
  );
};

export default Movies;