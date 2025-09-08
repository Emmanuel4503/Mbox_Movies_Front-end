"use client"

import { useState, useEffect, useRef } from "react"
import "./FAQ.css"

const FAQ = () => {
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

  const faqs = [
    {
      id: 1,
      question: "How do I create an account?",
      answer:
        'Creating an account is easy! Just click on the "Sign Up" button in the top right corner of the page, fill in your details, and you\'re ready to start reviewing movies.',
    },
    {
      id: 2,
      question: "Is mbox movies free to use?",
      answer:
        "Yes, mbox movies is completely free to use. We believe in making movie reviews accessible to everyone without any paywalls or subscription fees.",
    },
    {
      id: 3,
      question: "How does the rating system work?",
      answer:
        "Our rating system uses a 5-star scale. You can rate movies from 1 to 5 stars, with half-star increments. We also encourage you to write a detailed review to help others understand your perspective.",
    },
    {
      id: 4,
      question: "Can I edit or delete my reviews?",
      answer:
        "You can edit or delete your reviews at any time. Simply navigate to your profile, find the review you want to modify, and use the edit or delete options.",
    },
    {
      id: 5,
      question: "How can I become a moderator?",
      answer:
        "Moderators are selected from our most active and trusted community members. If you're consistently providing high-quality reviews and engaging positively with the community, you might be invited to join our moderation team.",
    },
    {
      id: 6,
      question: "Does mbox movies have a mobile app?",
      answer:
        "We're currently developing mobile apps for iOS and Android. In the meantime, our website is fully responsive and works great on mobile browsers.",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(null)

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="faq" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">Frequently  <span className="add">Asked</span> Questions</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div className={`faq-item fade-in ${activeIndex === index ? "active" : ""}`} key={faq.id}>
              <div className="faq-question" onClick={() => toggleAccordion(index)}>
                <h3>{faq.question}</h3>
                <span className="faq-icon"></span>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
