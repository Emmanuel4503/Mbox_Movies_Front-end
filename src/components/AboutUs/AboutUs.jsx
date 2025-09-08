"use client"

import { useEffect, useRef } from "react"
import "./AboutUs.css"

const AboutUs = () => {
  const sectionRef = useRef(null)
  const sponsorsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    if (sponsorsRef.current) {
      observer.observe(sponsorsRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      if (sponsorsRef.current) {
        observer.unobserve(sponsorsRef.current)
      }
    }
  }, [])

  const sponsors = [
    { id: 1, name: "Universal", logo: "https://www.hollywoodreporter.com/wp-content/uploads/2012/01/new_universal_logo_a_l.jpg?w=1440&h=810&crop=1" },
    { id: 2, name: "Warner Bros", logo: "https://cdn.shopify.com/s/files/1/0558/6413/1764/files/Warner_Bros_Logo_Design_History_Evolution_0_1024x1024.jpg?v=1694135967" },
    { id: 3, name: "Sony Pictures", logo: "https://media.sketchfab.com/models/e5803c3dc789416697a6940893f9de09/thumbnails/0d47c25add9a47be8db58c79e6e20496/b2c811b23ad9448093fc392fbc48004e.jpeg" },
    { id: 4, name: "Disney", logo: "https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/66b327ac7fb97c001d18e3a7.jpg" },
    { id: 5, name: "Paramount", logo: "https://static1.srcdn.com/wordpress/wp-content/uploads/2018/02/Paramount-Logo-in-Yelllow.jpg" },
    { id: 6, name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Netflix_logo.svg/2560px-Netflix_logo.svg.png" },
    { id: 7, name: "Amazon Studios", logo: "https://d1nslcd7m2225b.cloudfront.net/Pictures/480xAny/6/0/5/1297605_amazon-studios-logo.jpg" },
  ]

  // Duplicate sponsors for infinite scroll effect
  const duplicatedSponsors = [...sponsors, ...sponsors]

  return (
    <>
      <section className="about-us" ref={sectionRef}>
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About  <span className="add">mbox</span> movies</h2>
              <p className="about-description">
                At mbox movies, we believe in the power of honest film criticism. Our platform was created to help movie
                enthusiasts find and share authentic reviews about the films they love—or love to hate.
              </p>
              <p className="about-description">
                Unlike other review sites, we focus on building a community of passionate movie lovers who provide
                thoughtful, nuanced perspectives on cinema from all eras and genres.
              </p>
              <p className="about-description">
                Whether you're looking for your next movie night pick or want to share your thoughts on a recent
                blockbuster, mbox movies is your destination for genuine film discourse.
              </p>
              <button className="btn btn-primary">Join Our Community</button>
            </div>
            <div className="about-image">
              <div className="image-container">
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80"
                  alt="Movie theater"
                />
              </div>
              <div className="floating-elements">
                <div className="floating-element star-1"></div>
                <div className="floating-element star-2"></div>
                <div className="floating-element circle-1"></div>
                <div className="floating-element circle-2"></div>
              </div>
            </div>
          </div>
          <div className="about-accent-shapes">
            <div className="accent-shape shape-1"></div>
            <div className="accent-shape shape-2"></div>
            <div className="accent-shape shape-3"></div>
          </div>
        </div>
      </section>

      <section className="sponsors-section" ref={sponsorsRef}>
        <div className="container">
          <div className="sponsors-title-container">
            <h1 className="sponsors-title">Our Partners</h1>
            <p className="sponsors-description">
              We're proud to collaborate with these leading companies in the film industry to bring you the best movie
              reviews and experiences.
            </p>
          </div>
        </div>
        
        <div className="sponsors-container">
          <div className="sponsors-scroll">
            {duplicatedSponsors.map((sponsor, index) => (
              <div className="sponsor-item" key={`${sponsor.id}-${index}`}>
                <img src={sponsor.logo} alt={`${sponsor.name} logo`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutUs