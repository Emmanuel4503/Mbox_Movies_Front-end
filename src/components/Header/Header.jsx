"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Header.css"

const Header = ({ isLoggedIn, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Handle logout
  const handleLogout = () => {
    onLogout()
    navigate("/")
    setIsUserMenuOpen(false)
  }

  // Close mobile menu after navigation
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container header-container">
        {/* Logo/Website Name */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <h1>Mbox Movies</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            <li>
              <Link to="/movies">Movies</Link>
            </li>
            <li>
              <Link to="/community">Community</Link>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons or User Profile */}
        {isLoggedIn ? (
          <div className="mobile-actions">
            <div className="user-profile" ref={userMenuRef}>
              <div className="user-icon" onClick={toggleUserMenu}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              {isUserMenuOpen && (
              <div className="user-dropdown">
              <ul>
                <li
                  onClick={() => {
                    navigate("/profile")
                    setIsUserMenuOpen(false)
                  }}
                >
                  My Profile
                </li>
                <li
                  onClick={() => {
                    navigate("/favorites")
                    setIsUserMenuOpen(false)
                  }}
                >
                 Favorites
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="mobile-menu-button" onClick={toggleMenu}>
              <div className={`hamburger ${isMenuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`auth-buttons ${isLoggedIn ? 'mobile-hidden' : ''}`}>
              <Link to="/signin" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
            
            {/* Mobile Menu Button (when not logged in) */}
            <div className="mobile-menu-button" onClick={toggleMenu}>
              <div className={`hamburger ${isMenuOpen ? "active" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link to="/movies" onClick={closeMenu}>
              Movies
            </Link>
          </li>
          <li>
            <Link to="/community" onClick={closeMenu}>
              Community
            </Link>
          </li>
          <li>
  <Link to="/favorites" onClick={closeMenu}>
    Favorites
  </Link>
</li>
          {isLoggedIn ? (
            <>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleLogout()
                    closeMenu()
                  }}
                >
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signin" onClick={closeMenu}>
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={closeMenu}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  )
}

export default Header