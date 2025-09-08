"use client"

import { useEffect, useRef } from "react"
import "./HowItWorks.css"

const HowItWorks = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      },
      { threshold: 0.3 },
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

  const steps = [
    {
      id: 1,
      title: "Navigate to Movies",
      description: "Browse our extensive collection of movies from all genres and eras.",
      icon: "🎬",
    },
    {
      id: 2,
      title: "Search Movies",
      description: "Find exactly what you're looking for with our powerful search tools.",
      icon: "🔍",
    },
    {
      id: 3,
      title: "Leave a Review",
      description: "Share your thoughts and rate movies to help others discover great films.",
      icon: "✍️",
    },
    {
      id: 4,
      title: "Save Favorites",
      description: "Create your personal collection of favorite movies to watch later.",
      icon: "❤️",
    },
  ]

  return (
    <section className="how-it-works" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">How <span className="add">It</span> Works</h2>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step fade-in" key={step.id}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
