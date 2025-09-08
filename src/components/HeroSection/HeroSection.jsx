"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./HeroSection.css"

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()  // Import the navigate hook

  // Function to handle "Explore Now" button click
  const handleExploreClick = () => {
    navigate("/movies")
  }

  // Movie posters for carousel
  const slides = [
    {
      id: 1,
      image:
        "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
      title: "Discover Your Next Favorite Film",
    },
    {
      id: 2,
      image:
        "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      title: "Honest Reviews from Real Movie Lovers",
    },
    {
      id: 3,
      image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      title: "Join the Community of Film Enthusiasts",
    },
    {
      id: 4,
      image: "https://m.media-amazon.com/images/M/MV5BMTM3NTg2NDQzOF5BMl5BanBnXkFtZTcwNjc2NzQzOQ@@._V1_.jpg",
      title: "Rate, Review, and Discover Movies",
    },
    {
      id: 5,
      image:
        "https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
      title: "Your Voice Matters in Our Community",
    },
    {
      id: 6,
      image:
        "https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ZjcyLTg3YjEtMDQyM2ZjYzQ5YWFkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      title: "Find Hidden Gems and Blockbusters",
    },
  ]

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  return (
    <section className="hero-section">
      <div className="carousel">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-content">
              <h2>{slide.title}</h2>
              <button className="btn btn-primary" onClick={handleExploreClick}>Explore Now</button>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button className="carousel-arrow prev" onClick={prevSlide}>
          &#10094;
        </button>
        <button className="carousel-arrow next" onClick={nextSlide}>
          &#10095;
        </button>

        {/* Dots navigation */}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection