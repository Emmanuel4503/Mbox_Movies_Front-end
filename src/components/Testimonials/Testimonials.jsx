"use client"

import { useEffect, useRef, useState } from "react"
import "./Testimonials.css"

const Testimonials = () => {
  const sectionRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

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

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Film Enthusiast",
      avatar: "https://llso.uchicago.edu/sites/default/files/styles/large/public/2023-01/IMG_4420.jpeg?h=d318f057&itok=-3_1475w",
      quote:
        "mbox movies has completely changed how I discover new films. The community is so passionate and the reviews are always honest and insightful.",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Indie Filmmaker",
      avatar: "https://static.wixstatic.com/media/45281b_c4363a6b9fad4d348378989dca653f90~mv2.jpg/v1/fill/w_640,h_554,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/45281b_c4363a6b9fad4d348378989dca653f90~mv2.jpg",
      quote:
        "As a filmmaker, I appreciate the thoughtful criticism I get from the mbox community. It's helped me grow as an artist and connect with my audience.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Movie Blogger",
      avatar: "https://images.squarespace-cdn.com/content/v1/5da74c3f60e88671cdfabe9c/78360e94-e737-4ad4-bf7f-743b81ff1ed7/Emily+headshot+JLSF.jpg",
      quote:
        "I've been using mbox movies for over a year now, and it's become my go-to platform for finding hidden gems. The recommendation algorithm is spot on!",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Cinema Student",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ1F_nxksFEcWVC01OZVF2N_TwQ1nlz9kI_g&s",
      quote:
        "The depth of analysis in the reviews here is incredible. I've learned so much about film theory and criticism just by being part of this community.",
    },
    {
      id: 5,
      name: "Olivia Thompson",
      role: "Screenwriter",
      avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/womens-college-basketball/players/full/4433380.png",
      quote:
        "The discussions on mbox have provided me with invaluable insights for my writing. It's a goldmine for understanding what resonates with different audiences.",
    },
    {
      id: 6,
      name: "James Liu",
      role: "Movie Critic",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt11Hrd1gMPXe_cMGjbJcYxKN2JfQ5HgG-Tw&s",
      quote:
        "I've reviewed films professionally for years, but the community at mbox constantly surprises me with fresh perspectives I hadn't considered. It's reinvigorated my love for cinema.",
    },    
  ]

  const nextSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === Math.ceil(testimonials.length/3) - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? Math.ceil(testimonials.length/3) - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index) => {
    setActiveIndex(index)
  }

  return (
    <section className="testimonials compact-section" ref={sectionRef}>
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">What Our <span className="accent">Users</span> Say</h2>
        </div>
        
        <div className="testimonials-slider">
          <div 
            className="testimonials-track" 
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {Array(Math.ceil(testimonials.length/3)).fill().map((_, groupIndex) => (
              <div className="testimonials-group" key={`group-${groupIndex}`}>
                {testimonials.slice(groupIndex * 3, groupIndex * 3 + 3).map((testimonial) => (
                  <div className="testimonial-card" key={testimonial.id}>
                    <div className="testimonial-content">
                      <div className="testimonial-header">
                        <div className="testimonial-avatar">
                          <img src={testimonial.avatar} alt={testimonial.name} />
                        </div>
                        <div className="testimonial-author">
                          <h4>{testimonial.name}</h4>
                          <p>{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="testimonial-quote">"{testimonial.quote}"</p>
                      <div className="quote-decoration">"</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="testimonials-footer">
          <div className="testimonials-controls">
            <button className="control-btn prev-btn" onClick={prevSlide} aria-label="Previous testimonials">
              ←
            </button>
            <div className="pagination-dots">
              {Array(Math.ceil(testimonials.length/3)).fill().map((_, index) => (
                <button 
                  key={index} 
                  className={`pagination-dot ${activeIndex === index ? 'active' : ''}`} 
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button className="control-btn next-btn" onClick={nextSlide} aria-label="Next testimonials">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
