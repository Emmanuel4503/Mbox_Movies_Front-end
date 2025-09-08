"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Genres.css"

const GenresCollection = () => {
  const sectionRef = useRef(null)
  const [hoveredGenre, setHoveredGenre] = useState(null)
  const navigate = useNavigate()  // Import the navigate hook

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Function to handle navigation to movies page
  const handleBrowseAll = () => {
    navigate("/movies")
  }

  // Function to handle individual genre exploration
  const handleExploreGenre = (genreId) => {
    // You could pass the genre ID as a parameter to filter movies
    navigate(`/movies?genre=${genreId}`)
  }

  const genres = [
    {
      id: 1,
      title: "Drama & Emotion",
      description: "Powerful stories that move you and touch your heart",
      movieCount: 255,
      bgImage: "/api/placeholder/400/300", // Using placeholder as per instructions
      color: "#7e57c2",
      icon: "🎭",
    },
    {
      id: 2,
      title: "Comedy & Lighthearted",
      description: "Laugh out loud with our collection of funny films",
      movieCount: 189,
      bgImage: "/api/placeholder/400/300",
      color: "#ffab40",
      icon: "😂",
    },
    {
      id: 3,
      title: "Action & Adventure",
      description: "Thrilling sequences and epic journeys await",
      movieCount: 210,
      bgImage: "/api/placeholder/400/300",
      color: "#f44336",
      icon: "💥",
    },
    {
      id: 4,
      title: "Thriller & Suspense",
      description: "Edge-of-your-seat stories that keep you guessing",
      movieCount: 175,
      bgImage: "/api/placeholder/400/300",
      color: "#2e7d32",
      icon: "🔍",
    },
    {
      id: 5,
      title: "Sci-Fi & Fantasy",
      description: "Explore new worlds and impossible realities",
      movieCount: 165,
      bgImage: "/api/placeholder/400/300",
      color: "#1976d2",
      icon: "🚀",
    },
    {
      id: 6,
      title: "Real Life & Educational",
      description: "Documentaries and films based on true stories",
      movieCount: 140,
      bgImage: "/api/placeholder/400/300",
      color: "#9c27b0",
      icon: "📚",
    },
  ]

  return (
    <section className="genres-collection" ref={sectionRef}>
      <div className="container">
        <div className="genres-header">
          <h2 className="section-title">Explore Our <span className="accent">Collections</span></h2>
          <p className="genres-subtitle">Discover the perfect movies for any mood or interest</p>
        </div>
        
        <div className="genres-grid">
          {genres.map((genre) => (
            <div 
              className={`genre-card ${hoveredGenre === genre.id ? 'hovered' : ''}`}
              key={genre.id}
              onMouseEnter={() => setHoveredGenre(genre.id)}
              onMouseLeave={() => setHoveredGenre(null)}
              style={{
                '--genre-color': genre.color,
              }}
            >
              <div className="genre-background">
                <div className="genre-overlay"></div>
                <div className="genre-image" style={{ backgroundImage: `url(${genre.bgImage})` }}></div>
                <div className="genre-particles">
                  {[...Array(15)].map((_, i) => (
                    <span key={i} className="particle"></span>
                  ))}
                </div>
              </div>
              
              <div className="genre-content">
                <div className="genre-icon">{genre.icon}</div>
                <h3 className="genre-title">{genre.title}</h3>
                <p className="genre-description">{genre.description}</p>
                <div className="genre-meta">
                  <span className="genre-count">{genre.movieCount} movies</span>
                  <button 
                    className="genre-explore-btn" 
                    onClick={() => handleExploreGenre(genre.id)}
                  >
                    Explore
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="genres-footer">
          <button className="browse-all-btn" onClick={handleBrowseAll}>
            Browse All Categories
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default GenresCollection