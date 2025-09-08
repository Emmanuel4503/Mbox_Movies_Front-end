"use client"

import { Link } from "react-router-dom"
import "./NotFound.css"

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
          <Link to="/movies" className="btn btn-secondary">
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
